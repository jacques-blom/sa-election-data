"""Reconcile government geography with the IEC directory and prepare D1/R2 assets.
Requires shapely. Never allocates votes by area or by a town's centre point.
"""
import collections,gzip,json,pathlib,re,sqlite3,unicodedata
from shapely.geometry import shape,mapping,box
from shapely import make_valid,union_all
from shapely.strtree import STRtree
root=pathlib.Path(__file__).resolve().parents[2]
folder=root/'.data/geography'
provinces={'Eastern Cape':('1','eastern-cape','EC'),'Free State':('2','free-state','FS'),'Gauteng':('3','gauteng','GT'),'KwaZulu-Natal':('4','kwazulu-natal','KZN'),'Mpumalanga':('5','mpumalanga','MP'),'Northern Cape':('6','northern-cape','NC'),'Limpopo':('7','limpopo','LIM'),'North West':('8','north-west','NW'),'Western Cape':('9','western-cape','WC')}
province_by_code={v[2]:k for k,v in provinces.items()}
def slug(s):return re.sub('[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip('-')
def dump(p,value):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n')
def features(name,count):
 rows=[f for p in sorted((folder/name).glob('*.json')) for f in json.loads(p.read_text())['features']]
 assert len(rows)==count,(name,len(rows),count)
 return rows
# Read only directory columns: live payloads may be packed in R2.
for path in (root/'.wrangler/state/v3/d1').rglob('*.sqlite'):
 db=sqlite3.connect(f'file:{path}?mode=ro',uri=True);db.row_factory=sqlite3.Row
 try:
  packed=db.execute("SELECT count(*) FROM sqlite_master WHERE name='result_bundles'").fetchone()[0]
  join=' LEFT JOIN result_bundles b ON b.source_id=d.id ' if packed else ''
  pointer='COALESCE(b.directory_snapshot_id,d.active_snapshot_id)' if packed else 'd.active_snapshot_id'
  rows=[dict(r) for r in db.execute(f"SELECT r.level,r.area_id,r.ward_id,r.municipality_id,r.province_id,r.name,d.url FROM source_documents d {join} JOIN area_results r ON r.source_id=d.id AND r.snapshot_id={pointer} WHERE r.year=2026 AND r.level IN ('municipality','ward','voting-district')")]
  if rows:break
 except sqlite3.OperationalError:continue
else:raise RuntimeError('Local IEC directory unavailable')
municipalities={r['area_id']:r for r in rows if r['level']=='municipality'}
mun_by_code={r['name'].split(' - ')[0]:r for r in municipalities.values()}
wards={r['area_id']:r for r in rows if r['level']=='ward'}
vds={r['area_id']:r for r in rows if r['level']=='voting-district'}
ward_features=json.loads((root/'.data/maps/wards-2026.geojson').read_text())['features']
assert {f['properties']['id'] for f in ward_features}==set(wards)
ward_geoms=[make_valid(shape(f['geometry'])) for f in ward_features];tree=STRtree(ward_geoms)
ward_ids=[f['properties']['id'] for f in ward_features]
main_features=features('main-places',14039)
admin_features=features('municipalities',214)
province_features=features('provinces',9)
vd_features=features('voting-districts',23696)
pack_key='geometry-20261105-v3.pack';pack=(root/'.data/maps'/pack_key).open('wb');geometry_rows=[]
def archive(level,id,geom,props):
 if level in ('municipality','province'):
  # Independent ward coordinate rounding leaves metre-wide seams after union.
  # Close only display seams; preserve large holes (e.g. Lesotho). Ward lookup
  # and town/ward intersections always use the original ward geometry.
  display=geom.buffer(0.0001,join_style=2).buffer(-0.0001,join_style=2)
  assert not display.is_empty and abs(display.area-geom.area)/geom.area<0.01
  geom=display
 payload={'type':'Feature','properties':{'id':str(id),'level':level,**props},'geometry':mapping(geom)}
 compressed=gzip.compress(json.dumps(payload,separators=(',',':')).encode(),mtime=0)
 offset=pack.tell();pack.write(compressed)
 geometry_rows.append([level,str(id),*geom.bounds,pack_key,offset,len(compressed)])
 return payload
mun_shapes=collections.defaultdict(list);unknown_codes=[]
for f in admin_features:
 p=f['properties'];code=p['CAT_B']
 if code not in mun_by_code:unknown_codes.append(code);continue
 mun_shapes[code].append(make_valid(shape(f['geometry'])))
assert set(mun_shapes)==set(mun_by_code),(set(mun_by_code)-set(mun_shapes))
# Derive current administrative scope from the reconciled ward directory. The
# nominal municipality layer retains FS164, absent from the current IEC directory.
mun_shapes=collections.defaultdict(list)
for f,g in zip(ward_features,ward_geoms):
 r=wards[f['properties']['id']];code=municipalities[r['municipality_id']]['name'].split(' - ')[0];mun_shapes[code].append(g)
places=[];admin=[];metadata={'provinces':{},'municipalities':{}}
metro_names={'CPT':'Cape Town','JHB':'Johannesburg','TSH':'Tshwane','EKU':'Ekurhuleni','ETH':'eThekwini','BUF':'Buffalo City','MAN':'Mangaung','NMA':'Nelson Mandela Bay'}
extra_aliases={'CPT':['Kaapstad','iKapa'],'JHB':['Joburg','Jozi'],'TSH':['Pretoria'],'ETH':['Durban','eThekwini Metropolitan Municipality'],'NMA':['Nelson Mandela Bay Municipality']}
municipal_name_counts=collections.Counter(slug(metro_names.get(code,r['name'].split(' - ',1)[-1])) for code,r in mun_by_code.items())
for code,parts in sorted(mun_shapes.items()):
 r=mun_by_code[code];name=metro_names.get(code,r['name'].split(' - ',1)[-1]);s=slug(name)
 province=next(n for n,v in provinces.items() if v[0]==r['province_id']);g=union_all(parts)
 if municipal_name_counts[s]>1:s+='-'+slug(province)
 props={'name':name,'slug':s,'provinceId':r['province_id'],'code':code,'url':'/2026/places/'+s}
 admin.append(archive('municipality',r['area_id'],g,props))
 metadata['municipalities'][r['area_id']]={**props,'id':r['area_id'],'bbox':list(g.bounds)}
 places.append(dict(id='za-municipality-'+code.lower(),slug=s,name=name,kind='metro' if code in metro_names else 'municipality',province=province,aliases=list(dict.fromkeys([r['name'].split(' - ',1)[-1],code,name+' Municipality',*extra_aliases.get(code,[])])),description=f'Results for the whole {name} municipality. Browse its wards to explore a smaller area.',indexable=True,bbox=list(g.bounds),geometry={'level':'municipality','id':r['area_id']},municipalityName=name,relationships=[dict(election=2026,level='municipality',areaId=r['area_id'],relation='equals',boundaryVersion='MDBWards2026 union / IEC 2026',method='Union of all reconciled 2026 wards belonging to this IEC municipality')],sources=[{'label':'IEC municipality results','url':r['url']}]))
for f in province_features:
 p=f['properties'];name=p['PROVINCE'];id,s,code=provinces[name];g=union_all([g for f,g in zip(ward_features,ward_geoms) if wards[f['properties']['id']]['province_id']==id])
 props={'name':name,'slug':s,'code':code,'url':'/2026/provinces/'+s}
 admin.append(archive('province',id,g,props));metadata['provinces'][id]={**props,'id':id,'bbox':list(g.bounds)}
vd_mismatch=[]
for f in vd_features:
 p=f['properties'];id=str(p['VDNumber']);wid=str(p['WardId'])
 if id not in vds or vds[id]['ward_id']!=wid:vd_mismatch.append([id,wid,vds.get(id,{}).get('ward_id')]);continue
 f['properties']={'id':id,'wardId':wid,'name':p.get('VotingStat') or vds[id]['name'],'municipalityId':vds[id]['municipality_id']}
 archive('voting-district',id,make_valid(shape(f['geometry'])),f['properties'])
assert not vd_mismatch,vd_mismatch[:10]
assert len(vd_features)==len(vds)
for f,g in zip(ward_features,ward_geoms):
 id=f['properties']['id'];archive('ward',id,g,{**f['properties'],'municipalityId':wards[id]['municipality_id']})
# Keep main-place scopes explicit. Exclude unnamed/non-urban remainders.
named=[f for f in main_features if f['properties'].get('MP_NAME') and not re.search(r'\bNU\b|Non.?Urban',f['properties']['MP_NAME'],re.I)]
name_counts=collections.Counter(slug(f['properties']['MP_NAME']) for f in named)
reserved={p['slug'] for p in places};towns=[];unmatched=[];review=[]
for f in named:
 p=f['properties'];id=str(int(p['MP_CODE']));name=p['MP_NAME'].strip();g=make_valid(shape(f['geometry']))
 if g.is_empty or g.area==0:continue
 matches=[];covered=0
 for i in tree.query(g,predicate='intersects'):
  area=g.intersection(ward_geoms[i]).area
  # Ignore zero-area touches and numerical slivers below about one square metre.
  if area>1e-10:matches.append(ward_ids[i]);covered+=area
 if not matches:unmatched.append(id);continue
 matches.sort();mids=sorted({wards[w]['municipality_id'] for w in matches});munnames=[metadata['municipalities'][mid]['name'] for mid in mids]
 province=p['PR_NAME_20'];base=slug(name);s=base if name_counts[base]==1 and base not in reserved else base+'-town-'+slug(province)+'-'+id
 # Preserve existing URL and its specifically documented boundary discrepancy.
 if id=='366005':s='calvinia'
 source_match=len(mids)==1 and mun_by_code.get(p['MN_MDB_C_2'],{}).get('area_id')==mids[0]
 coverage=min(covered/g.area,1)
 indexable=source_match and coverage>=0.995 and id!='366005'
 if not indexable:review.append({'id':id,'name':name,'coverage':coverage,'municipalities':mids,'sourceCode':p['MN_MDB_C_2']})
 rel=[dict(election=2026,level='municipality',areaId=mid,relation='within' if len(mids)==1 else 'overlaps',boundaryVersion='Stats SA main places 2016 / MDB 2026',method='Positive-area intersections with reconciled 2026 wards') for mid in mids]
 rel += [dict(election=2026,level='ward',areaId=wid,relation='overlaps',boundaryVersion='Stats SA main places 2016 / MDBWards2026',method='Positive-area polygon intersection, not a centroid lookup') for wid in matches]
 aliases={'Port Elizaberth':['Port Elizaberth','Port Elizabeth','Gqeberha'],'Mbombela':['Nelspruit'],'Polokwane':['Pietersburg'],'Port Elizabeth':['Gqeberha'],'Uitenhage':['Kariega'],'King William\'s Town':['Qonce'],'Queenstown':['Komani'],'Pietersburg':['Polokwane'],'Nelspruit':['Mbombela']}.get(name,[])
 notes=[f'This page uses the Stats SA statistical main-place boundary labelled 2016. It overlaps {len(matches)} of the 2026 wards; the everyday town boundary may differ.']
 if id=='366005':notes.append('Hantam’s 2024/25 report associates Calvinia with wards 1, 2 and 6; this broader statistical extent also overlaps ward 7.')
 display_name='Port Elizabeth' if name=='Port Elizaberth' else name
 town=dict(id='za-main-place-'+id,slug=s,name=display_name,kind='town',province=province,aliases=aliases,description=f'{display_name} is covered by '+', '.join(munnames)+'. Explore the wards overlapping its statistical place boundary.',indexable=indexable,bbox=list(g.bounds),geometry={'level':'town','id':id},municipalityName=', '.join(munnames),relationships=rel,boundaryContext={'notes':notes,'method':'Positive-area intersections of the 2016 Stats SA main-place polygon and the MDB 2026 ward polygons. Full-ward figures include votes outside the place; votes are never allocated by overlap area.'},sources=[{'label':'Stats SA main places, hosted by DPME','url':'https://dpmegis.dpme.gov.za/arcgis/rest/services/Adminboundaries/MapServer/7'},{'label':'MDB 2026 wards','url':'https://services7.arcgis.com/oeoyTUJC8HEeYsRB/arcgis/rest/services/MDBWards2026/FeatureServer/0'}])
 archive('town',id,g,{'name':name,'slug':s,'url':'/2026/places/'+s});towns.append(town)
pack.close()
assert len({p['slug'] for p in [*places,*towns]})==len(places)+len(towns)
dump(root/'src/lib/places/municipalities.json',places)
dump(root/'src/lib/maps/administrative-index.json',metadata)
dump(folder/'directory-seed.json',{'places':places+towns,'geometries':geometry_rows})
dump(folder/'administrative.geojson',{'type':'FeatureCollection','features':admin})
dump(folder/'voting-districts.geojson',{'type':'FeatureCollection','features':vd_features})
dump(folder/'validation.json',{'municipalities':len(places),'towns':len(towns),'indexedTowns':sum(t['indexable'] for t in towns),'unmatched':unmatched,'review':review,'unknownMunicipalityCodes':unknown_codes,'wardCount':len(wards),'votingDistrictCount':len(vds)})
print('Prepared',len(places),'municipalities,',len(towns),'places;',sum(t['indexable'] for t in towns),'eligible for indexing;',len(unmatched),'unmatched; review',len(review),flush=True)
