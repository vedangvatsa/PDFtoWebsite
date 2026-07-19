CREATE TABLE IF NOT EXISTS email_opens (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  campaign TEXT NOT NULL DEFAULT 'unknown',
  content TEXT NOT NULL DEFAULT 'unknown',
  source TEXT NOT NULL DEFAULT 'unknown',
  ip TEXT NOT NULL DEFAULT 'unknown',
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_opens_campaign ON email_opens(campaign);
CREATE INDEX IF NOT EXISTS idx_email_opens_content ON email_opens(content);
CREATE INDEX IF NOT EXISTS idx_email_opens_created_at ON email_opens(created_at DESC);
