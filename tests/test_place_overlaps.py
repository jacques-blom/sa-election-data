"""Run with: python -m unittest discover -s tests -p 'test_place_overlaps.py'."""
import pathlib
import json
import sys
import unittest

from shapely.geometry import box

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / 'scripts/maps'))
from place_overlaps import WardOverlap, filter_boundary_slivers, overlap_coverage, reconcile_place_overlaps


class PlaceOverlapTests(unittest.TestCase):
    def setUp(self):
        self.place = box(0, 0, 10000, 10000)
        self.source = WardOverlap('source-ward', 'source', self.place)

    def resolve(self, foreign, source_id='source', primary=None):
        return filter_boundary_slivers(self.place, [primary or self.source, *foreign], source_id)

    def test_long_thin_edge_slivers_are_removed_together(self):
        slivers = [WardOverlap('west', 'neighbour', box(0, 0, 0.4, 10000)),
                   WardOverlap('east', 'another-neighbour', box(9999.6, 0, 10000, 10000))]
        removed, audit = self.resolve(slivers)
        self.assertEqual(removed, {'west', 'east'})
        self.assertAlmostEqual(audit['removedAreaM2'], 8000)
        self.assertEqual(audit['removedMunicipalityIds'], ['another-neighbour', 'neighbour'])

    def test_small_but_substantial_cross_boundary_patch_is_retained(self):
        # Same small fraction as a sliver, but reaches 50 metres into the place.
        removed, audit = self.resolve([WardOverlap('real', 'neighbour', box(0, 0, 50, 100))])
        self.assertEqual(removed, set())
        self.assertIsNone(audit)

    def test_material_narrow_cross_boundary_area_is_retained(self):
        removed, _ = self.resolve([WardOverlap('real', 'neighbour', box(0, 0, 5, 10000))])
        self.assertEqual(removed, set())

    def test_combined_foreign_area_is_checked_not_individual_wards(self):
        removed, _ = self.resolve([WardOverlap('west', 'one', box(0, 0, 0.6, 10000)),
                                   WardOverlap('east', 'two', box(9999.4, 0, 10000, 10000))])
        self.assertEqual(removed, set())

    def test_tiny_interior_enclave_is_retained(self):
        removed, _ = self.resolve([WardOverlap('enclave', 'neighbour', box(5000, 5000, 5001, 5001))])
        self.assertEqual(removed, set())

    def test_sliver_must_also_adjoin_source_council(self):
        primary = WardOverlap('source-ward', 'source', box(20, 0, 10000, 10000))
        removed, _ = self.resolve([WardOverlap('detached', 'neighbour', box(0, 0, 0.4, 10000))], primary=primary)
        self.assertEqual(removed, set())

    def test_missing_or_changed_source_council_keeps_relationships(self):
        slivers = [WardOverlap('west', 'neighbour', box(0, 0, 0.4, 10000))]
        for source in [None, 'old-municipality', 'neighbour']:
            with self.subTest(source=source):
                self.assertEqual(self.resolve(slivers, source_id=source)[0], set())

    def test_incomplete_source_coverage_is_not_auto_corrected(self):
        primary = WardOverlap('source-ward', 'source', box(100, 0, 10000, 10000))
        self.assertEqual(self.resolve([WardOverlap('east', 'neighbour', box(9999.6, 0, 10000, 10000))], primary=primary)[0], set())

    def test_genuine_cross_council_place_is_retained(self):
        primary = WardOverlap('source-ward', 'source', box(0, 0, 5000, 10000))
        self.assertEqual(self.resolve([WardOverlap('other-half', 'neighbour', box(5000, 0, 10000, 10000))], primary=primary)[0], set())

    def test_small_wards_within_source_council_are_preserved(self):
        overlap = WardOverlap('small-local', 'source', box(0, 0, 0.1, 1))
        removed, _ = self.resolve([overlap])
        self.assertEqual(removed, set())

    def test_coverage_does_not_double_count_overlapping_wards(self):
        overlaps = [WardOverlap('a', 'source', box(0, 0, 5000, 10000)),
                    WardOverlap('b', 'source', box(4000, 0, 9000, 10000))]
        self.assertAlmostEqual(overlap_coverage(self.place, overlaps), 0.9)
        self.assertEqual(overlap_coverage(self.place, []), 0)

    def test_geographic_wrapper_retains_original_geometry_and_units(self):
        place = box(28, -26, 28.1, -25.9)
        source = WardOverlap('local', 'source', place)
        sliver = WardOverlap('foreign', 'neighbour', box(28, -26, 28.000004, -25.9))
        kept, audit = reconcile_place_overlaps(place, [source, sliver], 'source')
        self.assertEqual(kept, [source])
        self.assertIs(kept[0].geometry, place)
        self.assertGreater(audit['removedAreaM2'], 1000)
        self.assertLess(audit['removedAreaFraction'], 0.0001)


class ArchivedPlaceOverlapTests(unittest.TestCase):
    @unittest.skipUnless((pathlib.Path(__file__).resolve().parents[1] / '.data/geography/main-places/11500.json').exists(),
                         'requires ignored government geography archives')
    def test_pretoria_retains_all_tshwane_wards_and_removes_only_madibeng(self):
        from shapely import make_valid
        from shapely.geometry import shape
        root = pathlib.Path(__file__).resolve().parents[1]
        features = json.loads((root / '.data/geography/main-places/11500.json').read_text())['features']
        feature = next(f for f in features if f['properties']['MP_CODE'] == 799035)
        place = make_valid(shape(feature['geometry']))
        overlaps = []
        for ward in json.loads((root / '.data/maps/wards-2026.geojson').read_text())['features']:
            geometry = make_valid(shape(ward['geometry']))
            if not place.intersects(geometry):
                continue
            intersection = place.intersection(geometry)
            if intersection.area > 1e-10:
                overlaps.append(WardOverlap(ward['properties']['id'], ward['properties']['code'], intersection))
        kept, audit = reconcile_place_overlaps(place, overlaps, feature['properties']['MN_MDB_C_2'])
        self.assertEqual(len(overlaps), 52)
        self.assertEqual(len(kept), 49)
        self.assertEqual({o.municipality_id for o in kept}, {'TSH'})
        self.assertEqual(audit['removedWardIds'], ['63702019', '63702029', '63702030'])
        self.assertEqual({o.ward_id for o in kept}, {o.ward_id for o in overlaps if o.municipality_id == 'TSH'})
        self.assertGreaterEqual(overlap_coverage(place, kept), 0.995)


if __name__ == '__main__':
    unittest.main()
