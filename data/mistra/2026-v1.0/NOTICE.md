# MISTRA source snapshot

Municipal administration CSV from the MISTRA Coalitions Barometer 2026 edition v1.0, released 7 October 2026. Source period: 1 November 2021–28 February 2026.

Upstream: https://github.com/mapungubwe-institute/coalitions-barometer-data/tree/3f4fe9baa0a50e8289cf1c1a0dc807cad993dd6d

Credit: Caromba, L., Simayile, S., & Ndletyana, A. (2026). MISTRA Coalitions Barometer Dataset, 2026 edition (Version 1.0) [Data set]. Mapungubwe Institute for Strategic Reflection. https://coalitions.mistra.org.za

Original MISTRA coding is CC BY 4.0 (see LICENSE). Underlying IEC seat allocations and municipal identifiers retain their original rights. Do not describe the whole database as exclusively CC BY or covered by Counted’s MIT code licence. Licensing exceptions: https://coalitions.mistra.org.za/sources.html

The CSV is retained as supplied. Normalisation converts dates, matches municipal codes, expands party labels, and attaches issue flags from upstream release notes. Generated data retains inauguration values and source notes. No financial indicators, population data, report prose or ACCORD database is imported.

Run `pnpm data:governance` to reproduce src/lib/governance/data.json. Its metadata contains the SHA-256 of the vendored CSV. Run `pnpm data:governance --check` to verify reproducibility.

Source roles, seats and officeholders are at inauguration. Subsequent changes may only appear in Notes. An Active row is not evidence of current government. Known inconsistencies are flagged, never silently corrected.

