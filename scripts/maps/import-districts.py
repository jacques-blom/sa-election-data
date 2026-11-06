"""Import MDB's 2026 district boundaries and official local-municipality membership."""
import json, pathlib, re, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from shapely import union_all, make_valid
from shapely.geometry import shape, mapping
root = pathlib.Path(__file__).resolve().parents[2]
base = 'https://services7.arcgis.com/oeoyTUJC8HEeYsRB/arcgis/rest/services/'
source = base + 'DistrictMunicipalities2026_15Mar2026/FeatureServer/0'
local_source = base + 'LocalMunicipalities2026_15Mar2026/FeatureServer/0'
folder = root / '.data/geography/districts'
folder.mkdir(parents=True, exist_ok=True)
def fetch(job):
    url, query, filename = job
    path = folder / filename
    if path.exists():
        cached = json.loads(path.read_text())
        if cached.get('features'): return cached
    with urllib.request.urlopen(url + '/query?' + urllib.parse.urlencode(query), timeout=90) as response:
        data = json.load(response)
    assert 'error' not in data and not data.get('exceededTransferLimit'), data
    path.write_text(json.dumps(data, separators=(',', ':')))
    return data
with ThreadPoolExecutor(max_workers=2) as pool:
    districts, membership = list(pool.map(fetch, [
        (source, dict(where='1=1', outFields='DISTRICT,DISTRICT_N,PROVINCE,CATEGORY', returnGeometry='true', outSR=4326, geometryPrecision=5, maxAllowableOffset=.001, f='geojson'), 'boundaries.json'),
        (local_source, dict(where="CATEGORY='B'", outFields='CAT_B,MUNICNAME,DISTRICT,DISTRICT_N,PROVINCE', returnGeometry='false', f='json'), 'membership.json'),
    ]))
districts['features'] = [f for f in districts['features'] if str(f['properties']['DISTRICT']).upper().startswith('DC')]
assert len(districts['features']) == 44, len(districts['features'])
administrative = json.loads((root / 'src/lib/maps/administrative-index.json').read_text())
municipalities = {m['code']: m for m in administrative['municipalities'].values()}
provinces = {p['code']: p for p in administrative['provinces'].values()}
# The official layer uses GP for Gauteng, while the IEC catalogue uses GT.
provinces['GP'] = provinces['GT']
provinces.update({p['name']:p for p in administrative['provinces'].values()})
geometries = {f['properties']['code']: make_valid(shape(f['geometry'])) for f in json.loads((root / '.data/geography/administrative.geojson').read_text())['features'] if f['properties']['level'] == 'municipality'}
out = root / 'public/maps/geometry/districts-2026'
out.mkdir(parents=True, exist_ok=True)
records = []
missing = set()
for feature in districts['features']:
    p = feature['properties']; code = p['DISTRICT']; name = p['DISTRICT_N'].strip()
    name = re.sub(r'\s+District Municipality$', '', name, flags=re.I)
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    codes = sorted({f['attributes']['CAT_B'] for f in membership['features'] if f['attributes']['DISTRICT'] == code})
    missing.update(c for c in codes if c not in municipalities)
    # The source retains legacy FS164; use the same reconciled scope as the explorer.
    codes = [c for c in codes if c in municipalities]
    merged = union_all([geometries[c] for c in codes])
    simplified = merged.simplify(.001, preserve_topology=True)
    assert simplified.is_valid and not simplified.is_empty and abs(simplified.area - merged.area) / merged.area < .005
    bbox = list(merged.bounds)
    feature['geometry'] = mapping(simplified)
    record = dict(id=code, code=code, name=name, slug=slug, province=provinces[p['PROVINCE']]['name'], provinceId=provinces[p['PROVINCE']]['id'], bbox=bbox,
        municipalityCodes=codes, municipalitySlugs=[municipalities[c]['slug'] for c in codes if c in municipalities], source=source, membershipSource=local_source)
    assert codes, code
    records.append(record)
    feature['id'] = code
    feature['properties'] = dict(id=code, name=name, level='district')
    (out / (code + '.geojson')).write_text(json.dumps(feature, separators=(',', ':')) + '\n')
assert missing == {'FS164'}, sorted(missing)
assert len({c for d in records for c in d['municipalityCodes']}) == 205
records.sort(key=lambda r: r['name'])
(root / 'src/lib/maps/district-index.json').write_text(json.dumps(records, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'districts': len(records), 'localMunicipalities':len({c for d in records for c in d['municipalityCodes']}), 'source':source}))
