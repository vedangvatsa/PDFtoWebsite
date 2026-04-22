-- Track which jobs have been posted to Telegram
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS telegram_posted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_jobs_telegram_posted ON jobs (telegram_posted_at NULLS FIRST);
