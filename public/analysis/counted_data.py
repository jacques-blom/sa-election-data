#!/usr/bin/env python3
"""Download a complete imported Counted scope for local analysis (Python 3.9+).

Standard library only. Public read-only GETs; no credentials or IEC requests.
Read manifest.json before analysis. Completion is not an election declaration.
"""
import argparse
import csv
import hashlib
import json
import re
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen

VERSION = "1.0.0"
LEVELS = ("national", "province", "municipality", "ward", "voting-district")
MAX_RESPONSE_BYTES = 16 * 1024 * 1024
KEYS = ["year", "level", "area_id"]
AREA_FIELDS = KEYS + ["name", "province_id", "municipality_id", "ward_id",
    "election_status", "source_url", "snapshot_id", "source_sha256", "area_reported_at",
    "snapshot_fetched_at", "last_successful_check_at", "freshness", "last_error",
    "party_list_scope", "ballot_scope", "party_rows",
    "registered_voters", "ballot_papers_cast", "valid_ballot_papers", "spoilt_ballot_papers",
    "reconciliation_status", "sum_of_published_rows", "source_reported_valid_ballots", "difference",
    "source_anomalies_json"] + [f"{kind}_{field}" for kind in
    ("municipalities", "wards", "voting_districts", "seats") for field in ("expected", "completed")]
PARTY_FIELDS = KEYS + ["entry_index", "source_entry_id", "entry_type", "party_id",
    "party_name", "party_name_source", "candidate_name", "votes_source_total", "votes_ward",
    "votes_pr", "source_share_percent", "seats_ward", "seats_pr", "seats_total", "source_anomalies_json"]


def now():
    return datetime.now(timezone.utc).isoformat()


class DownloadError(Exception):
    pass


class Client:
    def __init__(self, base_url="https://counted.co.za", interval=0.1):
        url = urlsplit(base_url)
        if (url.username or url.password or url.query or url.fragment or url.path not in ("", "/")
            or not url.hostname or not (url.scheme == "https" or
                (url.scheme == "http" and url.hostname in ("localhost", "127.0.0.1", "::1")))):
            raise DownloadError("base-url must be an HTTPS origin or local HTTP origin")
        self.base_url = base_url.rstrip("/")
        self.interval = interval
        self.requests = 0

    def get(self, path, params=None):
        url = self.base_url + path + ("?" + urlencode(params) if params else "")
        for attempt in range(3):
            if self.requests:
                time.sleep(self.interval)
            self.requests += 1
            try:
                request = Request(url, headers={"Accept": "application/json",
                    "User-Agent": "Counted-analysis/" + VERSION})
                with urlopen(request, timeout=30) as response:
                    body = response.read(MAX_RESPONSE_BYTES + 1)
                if len(body) > MAX_RESPONSE_BYTES:
                    raise DownloadError("Response exceeded 16 MiB: " + path)
                value = json.loads(body)
                if not isinstance(value, dict) or "error" in value:
                    raise DownloadError("Invalid API response: " + path)
                return value
            except HTTPError as error:
                if error.code not in (429, 500, 502, 503, 504) or attempt == 2:
                    raise DownloadError(f"HTTP {error.code}: {path}") from error
            except (URLError, TimeoutError) as error:
                if attempt == 2:
                    raise DownloadError("Network failure: " + path) from error
            except (ValueError, UnicodeError) as error:
                raise DownloadError("Invalid JSON: " + path) from error
            time.sleep(2 ** attempt)
        raise DownloadError("Retries exhausted: " + path)


def pages(client, path, key, params=None, page_size=200):
    rows, seen, total = [], set(), None
    while total is None or len(rows) < total:
        offset = len(rows)
        page = client.get(path, {**(params or {}), "limit": page_size, "offset": offset})
        count = page.get("total")
        if type(count) is not int or not 0 <= count <= 100000:
            raise DownloadError("Invalid pagination total: " + path)
        if total is not None and count != total:
            raise DownloadError("Inventory changed during pagination; retry the capture")
        total = count
        batch = page.get(key)
        if (page.get("offset") != offset or page.get("limit") != page_size
            or not isinstance(batch, list) or len(batch) != min(page_size, total - offset)):
            raise DownloadError("Incomplete or inconsistent page: " + path)
        for row in batch:
            identity = row.get("id")
            if not isinstance(identity, str) or not identity or identity in seen:
                raise DownloadError("Missing or duplicate identity: " + path)
            seen.add(identity)
            rows.append(row)
    return rows


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def file_hash(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def flatten(record):
    a, s, r = record["area"], record["source"], record["results"]
    key = {"year": record["election"]["year"], "level": a["level"], "area_id": a["id"]}
    quality = record["quality"]
    rec = quality["vote_total_reconciliation"]
    area = {**key, **{k: a.get(k) for k in ("name", "province_id", "municipality_id", "ward_id")},
        "election_status": record["election"]["status"], "source_url": s["url"],
        "source_sha256": s["sha256"], **{k: s.get(k) for k in
            ("snapshot_id", "area_reported_at", "snapshot_fetched_at", "last_successful_check_at", "freshness", "last_error")},
        "party_list_scope": r["party_list_scope"], "ballot_scope": r["ballot_scope"],
        "party_rows": len(r["parties"]), **r["reported_totals"],
        "reconciliation_status": rec["status"], **{k: rec.get(k) for k in
            ("sum_of_published_rows", "source_reported_valid_ballots", "difference")},
        "source_anomalies_json": json.dumps(quality["source_anomalies"], ensure_ascii=False)}
    for kind, progress in r["progress"].items():
        for field in ("expected", "completed"):
            area[f"{kind}_{field}"] = (progress or {}).get(field)
    parties = []
    for index, party in enumerate(r["parties"]):
        row = {**key, "entry_index": index, **{k: party.get(k) for k in
            ("source_entry_id", "entry_type", "party_id", "party_name", "party_name_source",
             "candidate_name", "source_share_percent")},
            "source_anomalies_json": json.dumps(party.get("source_anomalies", []), ensure_ascii=False)}
        for field in ("votes", "seats"):
            row.update({f"{field}_{k}": v for k, v in party[field].items()})
        parties.append(row)
    return area, parties


def capture(client, year, level, output, filters=None):
    if level not in LEVELS or not re.fullmatch(r"\d{4}", str(year)):
        raise DownloadError("Invalid year or level")
    filters = filters or {}
    if any(k not in ("province_id", "municipality_id", "ward_id") or
           not re.fullmatch(r"\d{1,20}", str(v)) for k, v in filters.items()):
        raise DownloadError("Invalid geographic filter")
    output = Path(output).absolute()
    if output.exists():
        raise DownloadError("Output directory must be new: " + str(output))
    started = now()
    path = f"/api/v1/elections/{year}"
    coverage = client.get(path)
    sources_before = pages(client, path + "/sources", "sources")
    source_map = {s["url"]: s for s in sources_before}
    if len(source_map) != len(sources_before):
        raise DownloadError("Ambiguous source URLs")
    params = {"level": level, **filters}
    areas = pages(client, path + "/areas", "areas", params)
    if not areas:
        raise DownloadError("No imported areas in this scope")
    used, party_count = {}, 0
    with tempfile.TemporaryDirectory(prefix="counted-capture-", dir=output.parent) as temporary:
        directory = Path(temporary)
        with (directory / "results.jsonl").open("w", encoding="utf-8") as raw, \
             (directory / "areas.csv").open("w", encoding="utf-8", newline="") as area_file, \
             (directory / "parties.csv").open("w", encoding="utf-8", newline="") as party_file:
            area_csv = csv.DictWriter(area_file, fieldnames=AREA_FIELDS)
            party_csv = csv.DictWriter(party_file, fieldnames=PARTY_FIELDS)
            area_csv.writeheader()
            party_csv.writeheader()
            for area in areas:
                identity = area["id"]
                if area.get("level") != level or not re.fullmatch(r"ZA|\d{1,20}", identity):
                    raise DownloadError("Invalid area identity")
                record = client.get(f"{path}/areas/{level}/{identity}")
                if (record["election"]["year"] != year or record["area"] !=
                    {k: v for k, v in area.items() if k != "results_url"} or "party_page" in record):
                    raise DownloadError("Area response does not match full inventory")
                source = record["source"]
                catalog = source_map.get(source["url"])
                if not catalog or not source["snapshot_id"] or catalog["active_snapshot_id"] != source["snapshot_id"]:
                    raise DownloadError("Source snapshot changed; retry the capture")
                used[source["url"]] = source["snapshot_id"]
                flat_area, parties = flatten(record)
                area_csv.writerow(flat_area)
                party_csv.writerows(parties)
                party_count += len(parties)
                raw.write(json.dumps(record, ensure_ascii=False) + "\n")
        sources_after = pages(client, path + "/sources", "sources")
        after = {s["url"]: s["active_snapshot_id"] for s in sources_after}
        if any(after.get(url) != snapshot for url, snapshot in used.items()):
            raise DownloadError("Source snapshot changed during capture; retry with a smaller scope")
        if pages(client, path + "/areas", "areas", params) != areas:
            raise DownloadError("Area inventory changed during capture; retry")
        write_json(directory / "sources.json", {"before": sources_before, "after": sources_after})
        files = {p.name: {"sha256": file_hash(p), "bytes": p.stat().st_size}
                 for p in directory.iterdir()}
        manifest = {"client_version": VERSION, "started_at": started, "finished_at": now(),
            "base_url": client.base_url, "year": year, "level": level, "filters": filters,
            "area_count": len(areas), "party_row_count": party_count,
            "complete_for_imported_scope": True, "source_snapshots": used,
            "coverage_at_start": coverage, "files": files,
            "limitations": ["Imported coverage is not all IEC areas or completed counting.",
                "Publication snapshots were stable across this capture; they are not one simultaneous IEC snapshot.",
                "Matching IDs do not establish unchanged boundaries between elections.",
                "Null is unavailable, not zero. PR and ward ballots must be analysed separately."]}
        write_json(directory / "manifest.json", manifest)
        # Reserve a new destination exclusively; publish the completion marker last.
        output.mkdir()
        for name in [*files, "manifest.json"]:
            (directory / name).rename(output / name)
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--year", type=int, required=True)
    parser.add_argument("--level", choices=LEVELS, default="municipality")
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--base-url", default="https://counted.co.za")
    for field in ("province-id", "municipality-id", "ward-id"):
        parser.add_argument("--" + field)
    args = parser.parse_args()
    filters = {k: getattr(args, k) for k in ("province_id", "municipality_id", "ward_id") if getattr(args, k)}
    try:
        manifest = capture(Client(args.base_url), args.year, args.level, args.output, filters)
    except (DownloadError, OSError, KeyError, TypeError, ValueError) as error:
        print("Capture failed; no complete dataset was published: " + str(error), file=sys.stderr)
        return 1
    print(json.dumps({"output": str(args.output.absolute()), "areas": manifest["area_count"],
        "party_rows": manifest["party_row_count"], "complete_for_imported_scope": True}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
