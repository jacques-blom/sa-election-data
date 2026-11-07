-- Anonymous cost reservations only. Never store conversation text or raw IPs.
CREATE TABLE IF NOT EXISTS chat_usage (
  bucket TEXT NOT NULL,
  day TEXT NOT NULL,
  turns INTEGER NOT NULL,
  PRIMARY KEY (bucket, day)
);
