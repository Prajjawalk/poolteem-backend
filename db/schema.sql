CREATE TABLE IF NOT EXISTS transcript_snippets (
    id SERIAL PRIMARY KEY,
    webex_meeting_id TEXT NOT NULL,
    jira_ticket_id TEXT NOT NULL,
    original_transcript TEXT NOT NULL,
    summary TEXT NOT NULL,
    one_liner TEXT NOT NULL,
    resource_links TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webex_meeting_id ON transcript_snippets(webex_meeting_id);
CREATE INDEX IF NOT EXISTS idx_jira_ticket_id ON transcript_snippets(jira_ticket_id);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    google_id TEXT UNIQUE,
    jira_access_token TEXT,
    jira_refresh_token TEXT,
    jira_token_expiry TIMESTAMP,
    webex_access_token TEXT,
    webex_refresh_token TEXT,
    webex_token_expiry TIMESTAMP,
    webex_user_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webex_webhooks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    webhook_id TEXT NOT NULL,
    target_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
); 