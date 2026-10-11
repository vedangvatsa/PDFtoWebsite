-- OpenNext D1 next-mode tag cache. Indexed point reads, bounded to active
-- deployment tags. Values use fixed slots so untrusted URL cardinality cannot
-- grow storage beyond 128 MiB plus row/index overhead.
CREATE TABLE IF NOT EXISTS revalidations (
  tag TEXT NOT NULL,
  revalidatedAt INTEGER NOT NULL,
  stale INTEGER,
  expire INTEGER DEFAULT NULL,
  UNIQUE(tag) ON CONFLICT REPLACE
);

CREATE TABLE IF NOT EXISTS cache_entries (
  slot INTEGER PRIMARY KEY CHECK (slot >= 0 AND slot < 1024),
  cache_key TEXT NOT NULL,
  value TEXT NOT NULL CHECK (length(CAST(value AS BLOB)) <= 131072),
  last_modified INTEGER NOT NULL
);

-- A single shared circuit prevents an outage from producing one failed
-- Supabase request per crawler URL or per Worker isolate.
CREATE TABLE IF NOT EXISTS origin_backoff (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  retry_after INTEGER NOT NULL,
  lease_until INTEGER NOT NULL
);
