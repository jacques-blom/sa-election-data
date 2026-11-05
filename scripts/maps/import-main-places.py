"""Archive Stats SA 2016 main places, in ordered resumable batches."""
import json,pathlib,urllib.request,urllib.parse,time
from concurrent.futures import ThreadPoolExecutor
root=pathlib.Path(__file__).resolve().parents[2]
out=root/'.data/geography/main-places';out.mkdir(parents=True,exist_ok=True)
base='https://dpmegis.dpme.gov.za/arcgis/rest/services/Adminboundaries/MapServer/7/query'
def fetch(offset):
 path=out/f'{offset:05}.json'
 if path.exists():return len(json.loads(path.read_text())['features'])
 params=dict(where='1=1',outFields='MP_CODE,MP_NAME,MN_MDB_C_2,MN_NAME_20,PR_NAME_20',returnGeometry='true',outSR=4326,geometryPrecision=6,maxAllowableOffset=0.00001,orderByFields='OBJECTID_1',resultOffset=offset,resultRecordCount=500,f='geojson')
 for attempt in range(4):
  try:
   with urllib.request.urlopen(base+'?'+urllib.parse.urlencode(params),timeout=120) as r:data=json.load(r)
   if 'error' in data:raise RuntimeError(data['error'])
   if not data.get('features'):raise RuntimeError('Empty page')
   path.write_text(json.dumps(data,separators=(',',':')));print(offset,len(data['features']),flush=True);return len(data['features'])
  except Exception:
   if attempt==3:raise
   time.sleep(2*(attempt+1))
with ThreadPoolExecutor(max_workers=3) as pool:
 counts=list(pool.map(fetch,range(0,14039,500)))
assert sum(counts)==14039,sum(counts)
print('All 14039 source main places archived.')
