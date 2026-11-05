"""Import the complete MDB 2026 layer for display tiles and stable ward metadata."""
import json, pathlib, urllib.request, urllib.parse

root = pathlib.Path(__file__).resolve().parents[2]
base = 'https://services7.arcgis.com/oeoyTUJC8HEeYsRB/arcgis/rest/services/MDBWards2026/FeatureServer/0'

def query(params):
    url = base + '/query?' + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=90) as response:
        data = json.load(response)
    if 'error' in data:
        raise RuntimeError(data['error'])
    return data

def points(coords):
    if isinstance(coords[0], (int, float)):
        yield coords
    else:
        for part in coords:
            yield from points(part)

expected = query(dict(where='1=1',returnCountOnly='true',f='json'))['count']
features, index = [], {}
for offset in range(0, expected, 500):
    page = query(dict(where='1=1',outFields='WardID,WardNo,MUNICNAME,CAT_B,Province',returnGeometry='true',
        outSR=4326,geometryPrecision=5,maxAllowableOffset=0.00005,f='geojson',
        orderByFields='WardID',resultOffset=offset,resultRecordCount=500))
    for f in page['features']:
        p=f['properties']; ward=str(p['WardID'])
        assert len(ward)==8 and ward.isdigit() and ward not in index
        coords=list(points(f['geometry']['coordinates']))
        bbox=[min(p[0] for p in coords),min(p[1] for p in coords),max(p[0] for p in coords),max(p[1] for p in coords)]
        props=dict(id=ward,number=int(p['WardNo']),municipality=p['MUNICNAME'],code=p['CAT_B'],province=p['Province'])
        index[ward]={**props,'bbox':bbox}
        features.append(dict(type='Feature',properties=props,geometry=f['geometry']))
    print(f'Imported {len(features)} / {expected}',flush=True)
assert len(features)==expected and len(index)==expected
out=root/'.data/maps';out.mkdir(parents=True,exist_ok=True)
(out/'wards-2026.geojson').write_text(json.dumps({'type':'FeatureCollection','features':features},separators=(',',':')))
(root/'src/lib/maps/ward-index.json').write_text(json.dumps(index,separators=(',',':'))+'\n')
(out/'wards-2026-source.json').write_text(json.dumps({'source':base,'count':expected,'coordinateSystem':'EPSG:4326','geometryPrecision':5,'maxAllowableOffset':0.00005},indent=2)+'\n')
