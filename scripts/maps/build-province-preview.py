"""Build the small national overview from the reconciled administrative boundaries.

Requires Shapely, as does build-geography.py. This is display geometry only;
ward lookup and the detailed municipality/ward tiles are unchanged.
"""
import json
from pathlib import Path
from shapely.geometry import mapping, shape

root = Path(__file__).resolve().parents[2]
source = json.loads((root / '.data/geography/administrative.geojson').read_text())
features = []

def rounded(value):
    if isinstance(value, (list, tuple)):
        return [rounded(child) for child in value]
    return round(value, 4)

for feature in source['features']:
    if feature['properties']['level'] != 'province':
        continue
    original = shape(feature['geometry'])
    # About half a screen pixel at zoom 6.
    geometry = mapping(original.simplify(0.01, preserve_topology=True))
    geometry['coordinates'] = rounded(geometry['coordinates'])
    simplified = shape(geometry)
    assert simplified.is_valid and not simplified.is_empty
    assert abs(simplified.area - original.area) / original.area < 0.005
    features.append({'type': 'Feature', 'properties': feature['properties'], 'geometry': geometry})

assert {f['properties']['id'] for f in features} == {str(i) for i in range(1, 10)}
features.sort(key=lambda f: f['properties']['id'])
payload = json.dumps({'type': 'FeatureCollection', 'features': features}, separators=(',', ':')) + '\n'
assert len(payload.encode()) < 75000, 'Keep the national overview small'
output = root / 'public/maps/geometry/provinces-2026-20261105-v3.geojson'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(payload)
print(f'Wrote {len(features)} provinces, {len(payload.encode()):,} bytes: {output.relative_to(root)}')
