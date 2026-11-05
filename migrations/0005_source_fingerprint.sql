-- Remember the last validated source with report-generation dates excluded.
-- Clock-only regenerations can skip normalization without hiding corrections.
ALTER TABLE sync_state ADD COLUMN last_source_content_sha256 TEXT;
