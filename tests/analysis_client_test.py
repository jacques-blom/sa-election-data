import copy
import csv
import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("counted_data", Path(__file__).resolve().parents[1] / "public/analysis/counted_data.py")
client_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(client_module)


class FixtureAPI:
    base_url = "https://counted.example"

    def __init__(self, count=201, mode=None):
        self.mode = mode
        self.source_reads = 0
        self.area_reads = 0
        self.calls = []
        self.areas = [{"level": "municipality", "id": str(i), "name": "Area " + str(i),
            "province_id": "9", "municipality_id": str(i), "ward_id": None,
            "results_url": f"/api/v1/elections/2026/areas/municipality/{i}"} for i in range(1, count + 1)]
        self.sources = [{"id": str(i), "url": "https://iec.example/" + str(i), "active_snapshot_id": "v1"}
            for i in range(1, count + 1)]

    def get(self, path, params=None):
        self.calls.append((path, params))
        if params is not None:
            kind = "sources" if path.endswith("sources") else "areas"
            rows = copy.deepcopy(getattr(self, kind))
            offset, limit = params["offset"], params["limit"]
            if kind == "sources" and offset == 0:
                self.source_reads += 1
            if kind == "areas" and offset == 0:
                self.area_reads += 1
            if kind == "sources" and self.source_reads > 1 and self.mode == "changed_snapshot":
                rows[0]["active_snapshot_id"] = "v2"
            if kind == "areas" and self.area_reads > 1 and self.mode == "changed_area":
                rows[0]["name"] = "Changed"
            batch = rows[offset:offset + limit]
            if kind == "areas" and self.mode == "short_page":
                batch = batch[:-1]
            if kind == "areas" and offset and self.mode == "duplicate":
                batch[0] = rows[0]
            return {kind: batch, "offset": offset, "limit": limit, "total": len(rows)}
        if path.endswith("/2026"):
            return {"election": {"year": 2026, "status": "provisional"}, "coverage": [{"areas": len(self.areas)}]}
        area = copy.deepcopy(self.areas[int(path.rsplit("/", 1)[1]) - 1])
        del area["results_url"]
        party = {"source_entry_id": "7", "entry_type": "party_or_candidate", "party_id": "7",
            "party_name": "Party", "party_name_source": "result_file", "candidate_name": None,
            "votes": {"source_total": 10, "ward": None, "pr": 10}, "source_share_percent": None,
            "seats": {"ward": None, "pr": 0, "total": None}}
        return {"election": {"year": 2026, "status": "provisional"}, "area": area,
            "source": {"url": "https://iec.example/" + area["id"], "snapshot_id": "v0" if self.mode == "old_result" else "v1",
                "sha256": "source-hash", "freshness": "stale"},
            "results": {"parties": [party, {**party, "candidate_name": "Another candidate"}],
                "party_list_scope": "all_rows_in_source", "ballot_scope": "source_combined",
                "reported_totals": {"registered_voters": None, "ballot_papers_cast": None,
                    "valid_ballot_papers": 25, "spoilt_ballot_papers": None},
                "progress": {"municipalities": None, "wards": {"expected": 5, "completed": 2},
                    "voting_districts": None, "seats": None}},
            "quality": {"source_anomalies": [], "vote_total_reconciliation": {
                "status": "differs_from_reported_total", "sum_of_published_rows": 20,
                "source_reported_valid_ballots": 25, "difference": 5}}, "caveats": ["Provisional"]}


class CaptureTests(unittest.TestCase):
    def test_all_pages_full_records_and_reproducible_manifest(self):
        api = FixtureAPI()
        with tempfile.TemporaryDirectory() as directory:
            out = Path(directory) / "dataset"
            manifest = client_module.capture(api, 2026, "municipality", out)
            self.assertEqual(manifest["area_count"], 201)
            self.assertEqual(manifest["party_row_count"], 402)
            self.assertTrue(manifest["complete_for_imported_scope"])
            for name, expected in manifest["files"].items():
                content = (out / name).read_bytes()
                self.assertEqual(hashlib.sha256(content).hexdigest(), expected["sha256"])
                self.assertEqual(len(content), expected["bytes"])
            raw = [json.loads(line) for line in (out / "results.jsonl").read_text().splitlines()]
            self.assertIsNone(raw[0]["results"]["parties"][0]["votes"]["ward"])
            self.assertEqual(raw[-1]["area"]["id"], "201")
            with (out / "parties.csv").open() as handle:
                parties = list(csv.DictReader(handle))
            self.assertEqual(parties[0]["votes_ward"], "")
            self.assertEqual(parties[0]["seats_pr"], "0")
            self.assertEqual(parties[1]["entry_index"], "1")
            self.assertEqual(parties[1]["candidate_name"], "Another candidate")
            with (out / "areas.csv").open() as handle:
                area = next(csv.DictReader(handle))
            self.assertEqual(area["reconciliation_status"], "differs_from_reported_total")
            self.assertEqual(area["wards_completed"], "2")
            self.assertTrue(any(p and p["offset"] == 200 for _, p in api.calls))

    def test_rejects_incomplete_or_changing_capture_without_publishing(self):
        for mode in ("changed_snapshot", "changed_area", "short_page", "duplicate", "old_result"):
            with self.subTest(mode=mode), tempfile.TemporaryDirectory() as directory:
                out = Path(directory) / "dataset"
                with self.assertRaises(client_module.DownloadError):
                    client_module.capture(FixtureAPI(mode=mode), 2026, "municipality", out)
                self.assertFalse(out.exists())
                self.assertEqual(list(Path(directory).iterdir()), [])

    def test_no_overwrite_or_empty_success(self):
        with tempfile.TemporaryDirectory() as directory:
            out = Path(directory) / "dataset"
            out.mkdir()
            (out / "mine").write_text("keep")
            with self.assertRaises(client_module.DownloadError):
                client_module.capture(FixtureAPI(), 2026, "municipality", out)
            self.assertEqual((out / "mine").read_text(), "keep")
            with self.assertRaises(client_module.DownloadError):
                client_module.capture(FixtureAPI(count=0), 2026, "municipality", Path(directory) / "empty")

    def test_filters_are_applied_to_both_inventory_reads(self):
        api = FixtureAPI(count=1)
        with tempfile.TemporaryDirectory() as directory:
            client_module.capture(api, 2026, "municipality", Path(directory) / "data", {"province_id": "9"})
        inventories = [params for path, params in api.calls if path.endswith("/areas")]
        self.assertEqual(len(inventories), 2)
        self.assertTrue(all(params["province_id"] == "9" for params in inventories))

    def test_base_url_and_filter_validation(self):
        for url in ("http://public.example", "https://name:secret@example.org", "https://example.org?key=x",
                    "file:///etc/passwd", "https://example.org/api"):
            with self.subTest(url=url), self.assertRaises(client_module.DownloadError):
                client_module.Client(url)
        self.assertEqual(client_module.Client("http://localhost:4321/").base_url, "http://localhost:4321")
        with self.assertRaises(client_module.DownloadError):
            client_module.capture(FixtureAPI(), 2026, "municipality", "unused", {"municipality_id": "../other"})


if __name__ == "__main__":
    unittest.main()
