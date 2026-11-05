"""Fetch display-only 2026 MDB polygons. Preserve IDs for joining IEC results."""
import json, pathlib, urllib.request, urllib.parse
root = pathlib.Path(__file__).resolve().parents[2]
base = 'https://services7.arcgis.com/oeoyTUJC8HEeYsRB/arcgis/rest/services/MDBWards2026/FeatureServer/0'
for code,slug,expected in [('CPT','cape-town',118),('NC065','hantam',7)]:
 params = dict(where=f"CAT_B='{code}'",outFields='WardID,WardNo,MUNICNAME,CAT_B',returnGeometry='true',outSR=4326,geometryPrecision=5,maxAllowableOffset=0.00005,f='geojson')
 url = base+'/query?'+urllib.parse.urlencode(params)
 data = json.load(urllib.request.urlopen(url))
 assert len(data.get('features',[])) == expected and not data.get('exceededTransferLimit'),data.keys()
 features=[]
 for feature in data['features']:
  p=feature['properties'];features.append(dict(type='Feature',id=str(p['WardID']),properties=dict(id=str(p['WardID']),number=p['WardNo'],municipality=slug,name=p['MUNICNAME']),geometry=feature['geometry']))
 out={'type':'FeatureCollection','features':features}
 (root/'public/maps/geometry'/f'{slug}-2026.geojson').write_text(json.dumps(out,separators=(',',':')))
 print(slug,len(features))
calvinia=json.loads((root.parent/'election-research/2026-11-05/geography/calvinia.json').read_text())
for f in calvinia['features']: f['properties']={'id':'366005','name':'Calvinia statistical extent (2016)'}
(root/'public/maps/geometry/calvinia-2016.geojson').write_text(json.dumps(calvinia,separators=(',',':')))
