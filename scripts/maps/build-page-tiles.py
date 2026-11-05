import os,pathlib,subprocess
root=pathlib.Path(__file__).resolve().parents[2]
for source,key in [('administrative','administrative-2026-20261105-v3'),('voting-districts','voting-districts-2026-20261105')]:
 subprocess.run([os.environ.get('ELECTION_TIPPECANOE','tippecanoe'),'-o',str(root/'.data/maps'/f'{key}.pmtiles'),'-l',source,'-Z','3','-z','12','--no-feature-limit','--no-tile-size-limit','--no-tiny-polygon-reduction','--force',str(root/'.data/geography'/f'{source}.geojson')],check=True)
