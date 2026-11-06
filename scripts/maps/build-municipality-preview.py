"""Build the explorer's municipal overview from reconciled display boundaries.

Requires Shapely. Full geometry remains available for selected outlines and
address lookup; this file is only displayed below ward zoom (zoom 8).
"""
import json
from pathlib import Path
from shapely.geometry import mapping, shape

root = Path(__file__).resolve().parents[2]
source = json.loads((root / '.data/geography/administrative.geojson').read_text())
catalogue = json.loads((root / 'src/lib/maps/administrative-index.json').read_text())['municipalities']

def rounded(value):
    if isinstance(value, (list, tuple)):
        return [rounded(child) for child in value]
    return round(value, 5)

features = []
for feature in source['features']:
    if feature['properties']['level'] != 'municipality':
        continue
    original = shape(feature['geometry'])
    # Less than half a screen pixel at the overview's maximum zoom.
    display = original.simplify(0.002, preserve_topology=True)
    geometry = mapping(display)
    geometry['coordinates'] = rounded(geometry['coordinates'])
    simplified = shape(geometry)
    if not simplified.is_valid or simplified.is_empty:
        geometry = mapping(display)
        simplified = display
    assert simplified.is_valid and not simplified.is_empty
    assert abs(simplified.area - original.area) / original.area < 0.005
    features.append({'type': 'Feature', 'properties': {'id': feature['properties']['id']}, 'geometry': geometry})

assert {f['properties']['id'] for f in features} == set(catalogue)
features.sort(key=lambda feature: feature['properties']['id'])
payload = json.dumps({'type': 'FeatureCollection', 'features': features}, separators=(',', ':')) + '\n'
assert len(payload.encode()) < 1_000_000, 'Keep the municipal overview below 1 MB'
output = root / 'public/maps/geometry/municipalities-2026-20261105-v3.geojson'
output.write_text(payload)
print(f'Wrote {len(features)} municipalities, {len(payload.encode()):,} bytes: {output.relative_to(root)}')
