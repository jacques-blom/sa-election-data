"""Build display vector tiles after import-national-wards.py (Tippecanoe 2.79+)."""
import os, pathlib, subprocess
root = pathlib.Path(__file__).resolve().parents[2]
subprocess.run([
    os.environ.get('ELECTION_TIPPECANOE', 'tippecanoe'),
    '-o', str(root/'.data/maps/wards-2026-20261105.pmtiles'),
    '-l', 'wards', '-Z', '3', '-z', '12',
    '--no-feature-limit', '--no-tile-size-limit', '--no-tiny-polygon-reduction',
    '--force', str(root/'.data/maps/wards-2026.geojson'),
], check=True)
