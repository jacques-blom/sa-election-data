"""Conservative reconciliation of place/ward boundary precision differences.

The archived wards are simplified by 0.00005 degrees and rounded to five
decimals; places use 0.00001 degrees and six decimals. Ten metres covers their
combined positional precision in South Africa. This is a matching tolerance,
not a change to either boundary or an allocation of votes.
"""
from dataclasses import dataclass
from functools import lru_cache
from math import floor

from pyproj import Transformer
from shapely import make_valid, union_all
from shapely.geometry.base import BaseGeometry
from shapely.ops import transform

BOUNDARY_TOLERANCE_METRES = 10.0
MAX_FOREIGN_AREA_FRACTION = 0.0001  # 0.01% of the whole place, across all other councils.
MIN_SOURCE_COVERAGE = 0.995


@dataclass(frozen=True)
class WardOverlap:
    ward_id: str
    municipality_id: str
    geometry: BaseGeometry


def filter_boundary_slivers(place, overlaps, source_municipality_id):
    """Return removable ward IDs and evidence; all input geometry is in metres.

    Require agreement with the source council, near-complete coverage by that
    council, a negligible combined foreign area, and proximity to BOTH the
    place's edge and the source-council overlap. A small area alone is never
    sufficient. If any condition fails, retain every relationship for review.
    """
    if not source_municipality_id or place.is_empty or place.area <= 0:
        return set(), None
    primary = [o for o in overlaps if o.municipality_id == source_municipality_id]
    foreign = [o for o in overlaps if o.municipality_id != source_municipality_id]
    if not primary or not foreign:
        return set(), None
    source = union_all([o.geometry for o in primary])
    outside = union_all([o.geometry for o in foreign])
    fraction = outside.area / place.area
    source_coverage = source.area / place.area
    if outside.is_empty or outside.area <= 0 or source_coverage < MIN_SOURCE_COVERAGE:
        return set(), None
    if fraction > MAX_FOREIGN_AREA_FRACTION:
        return set(), None
    boundary = place.boundary
    if boundary is None or not boundary.buffer(BOUNDARY_TOLERANCE_METRES).covers(outside):
        return set(), None
    if not source.buffer(BOUNDARY_TOLERANCE_METRES).covers(outside):
        return set(), None
    removed = {o.ward_id for o in foreign}
    return removed, {
        'sourceMunicipality': source_municipality_id,
        'removedWardIds': sorted(removed),
        'removedMunicipalityIds': sorted({o.municipality_id for o in foreign}),
        'removedAreaM2': outside.area,
        'removedAreaFraction': fraction,
        'sourceCoverage': source_coverage,
        'toleranceMetres': BOUNDARY_TOLERANCE_METRES,
    }


@lru_cache(maxsize=60)
def _projector(zone):
    return Transformer.from_crs(4326, 32700 + zone, always_xy=True).transform


def reconcile_place_overlaps(place, overlaps, source_municipality_id):
    """Filter WGS84 overlaps, retaining the original geometry for kept wards."""
    if not source_municipality_id or len({o.municipality_id for o in overlaps}) < 2:
        return overlaps, None
    # The longitude selects a local metric CRS only; it never selects a council.
    longitude = (place.bounds[0] + place.bounds[2]) / 2
    project = _projector(max(1, min(60, floor((longitude + 180) / 6) + 1)))
    # Reprojection can turn near-coincident rings into invalid polygons again.
    metric_place = make_valid(transform(project, place))
    metric_overlaps = [WardOverlap(o.ward_id, o.municipality_id, make_valid(transform(project, o.geometry))) for o in overlaps]
    removed, evidence = filter_boundary_slivers(metric_place, metric_overlaps, source_municipality_id)
    return [o for o in overlaps if o.ward_id not in removed], evidence


def overlap_coverage(place, overlaps):
    """Union coverage: overlapping ward polygons must not count the same land twice."""
    if place.is_empty or place.area <= 0 or not overlaps:
        return 0.0
    return min(union_all([o.geometry for o in overlaps]).area / place.area, 1.0)
