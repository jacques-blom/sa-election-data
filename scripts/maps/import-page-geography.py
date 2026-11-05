"""Archive official MDB administrative and voting-district display geometry."""
import json,pathlib,urllib.request,urllib.parse,time
from concurrent.futures import ThreadPoolExecutor
root=pathlib.Path(__file__).resolve().parents[2]
base='https://services7.arcgis.com/oeoyTUJC8HEeYsRB/arcgis/rest/services/'
layers=[('provinces','Provinces','CODE,PROVINCE',9),('municipalities','LocalMunicipalities2026_15Mar2026','CAT_B,MUNICNAME,PROVINCE,CATEGORY',214),('voting-districts','VotingDistricts2026_Final','VDNumber,WardId,CAT_B,MUNICNAME,Province,VotingStat',23696)]
def fetch(job):
 slug,service,fields,count,offset=job
 folder=root/'.data/geography'/slug;folder.mkdir(parents=True,exist_ok=True);path=folder/f'{offset:05}.json'
 if path.exists():return
 q=dict(where='1=1',outFields=fields,returnGeometry='true',outSR=4326,geometryPrecision=5,maxAllowableOffset=0.00005,orderByFields='FID',resultOffset=offset,resultRecordCount=1000,f='geojson')
 for attempt in range(3):
  try:
   with urllib.request.urlopen(base+service+'/FeatureServer/0/query?'+urllib.parse.urlencode(q),timeout=100) as r:d=json.load(r)
   if 'error' in d:raise RuntimeError(d['error'])
   assert len(d['features'])==min(1000,count-offset)
   path.write_text(json.dumps(d,separators=(',',':')));print(slug,offset,len(d['features']),flush=True);return
  except Exception:
   if attempt==2:raise
   time.sleep(2)
with ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(fetch,[(slug,service,fields,count,offset) for slug,service,fields,count in layers for offset in range(0,count,1000)]))
