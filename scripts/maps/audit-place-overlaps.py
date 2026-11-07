"""Read-only national audit of the place/council precision rule.

Uses the existing source archives and directory seed. Writes only the requested
JSON report; does not change the directory, geometry packs, or database.
"""
import argparse
import json
import pathlib

from shapely import make_valid
from shapely.geometry import shape
from shapely.strtree import STRtree

from place_overlaps import WardOverlap, reconcile_place_overlaps, overlap_coverage

root = pathlib.Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=pathlib.Path, default=root / '.data/geography/overlap-audit.json')
args = parser.parse_args()
seed = json.loads((root / '.data/geography/directory-seed.json').read_text())
places = {p['id'].removeprefix('za-main-place-'): p for p in seed['places'] if p['kind'] == 'town'}
councils = {p['geometry']['id']: p for p in seed['places'] if p['kind'] in ('metro', 'municipality')}
source_codes = {p['id'].removeprefix('za-municipality-').upper(): mid for mid, p in councils.items()}
wards = json.loads((root / '.data/maps/wards-2026.geojson').read_text())['features']
geometries = [make_valid(shape(f['geometry'])) for f in wards]
tree = STRtree(geometries)
report = {'places': 0, 'crossCouncilBefore': 0, 'crossCouncilAfter': 0, 'indexableAfter': 0,
          'changed': [], 'indexingChanges': [], 'retainedCrossCouncilExamples': [], 'checks': {}}

for path in sorted((root / '.data/geography/main-places').glob('*.json')):
    for feature in json.loads(path.read_text())['features']:
        props = feature['properties']
        place_id = str(int(props['MP_CODE']))
        if place_id not in places:
            continue
        place = places[place_id]
        geometry = make_valid(shape(feature['geometry']))
        overlaps = []
        for index in tree.query(geometry, predicate='intersects'):
            intersection = geometry.intersection(geometries[index])
            if intersection.area > 1e-10:
                ward = wards[index]['properties']
                overlaps.append(WardOverlap(ward['id'], source_codes[ward['code']], intersection))
        source = source_codes.get(props['MN_MDB_C_2'])
        kept, evidence = reconcile_place_overlaps(geometry, overlaps, source)
        before = {o.municipality_id for o in overlaps}
        after = {o.municipality_id for o in kept}
        coverage = overlap_coverage(geometry, kept)
        indexable = after == {source} and coverage >= 0.995 and place_id != '366005'
        report['places'] += 1
        report['crossCouncilBefore'] += len(before) > 1
        report['crossCouncilAfter'] += len(after) > 1
        report['indexableAfter'] += indexable
        detail = {'id': place_id, 'slug': place['slug'], 'name': place['name'],
                  'before': sorted(before), 'after': sorted(after), 'coverage': coverage,
                  'wardCountBefore': len(overlaps), 'wardCountAfter': len(kept), 'indexable': indexable}
        if evidence:
            report['changed'].append({**detail, **evidence})
        if indexable != place['indexable']:
            report['indexingChanges'].append(detail)
        if len(after) > 1 and len(report['retainedCrossCouncilExamples']) < 20:
            report['retainedCrossCouncilExamples'].append(detail)
        if place['slug'] in ('pretoria', 'durban', 'calvinia', 'pietermaritzburg', 'groot-brakrivier'):
            report['checks'][place['slug']] = detail
        if report['places'] % 2000 == 0:
            print(f"Audited {report['places']} places; {len(report['changed'])} precision corrections", flush=True)

assert report['places'] == len(places), f"Incomplete audit: {report['places']} of {len(places)} places"
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({k: v for k, v in report.items() if k not in ('changed', 'indexingChanges', 'retainedCrossCouncilExamples')}, indent=2))
print(f"Corrections: {len(report['changed'])}; indexing changes: {len(report['indexingChanges'])}; report: {args.output}")
