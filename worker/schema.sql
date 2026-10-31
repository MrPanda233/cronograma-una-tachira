-- Base de datos de comentarios (Cloudflare D1: cronograma-comentarios).
-- `visitor` es una huella cifrada: nunca se guarda la IP.

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES comments(id),
  nick TEXT NOT NULL,
  tag TEXT NOT NULL,
  body TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  visitor TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'visible'
);
CREATE INDEX IF NOT EXISTS idx_comments_list ON comments(status, parent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_visitor ON comments(visitor, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_fingerprint ON comments(fingerprint, created_at);

CREATE TABLE IF NOT EXISTS reactions (
  comment_id TEXT NOT NULL REFERENCES comments(id),
  emoji TEXT NOT NULL,
  visitor TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (comment_id, emoji, visitor)
);
CREATE INDEX IF NOT EXISTS idx_reactions_visitor ON reactions(visitor, created_at);

CREATE TABLE IF NOT EXISTS reports (
  comment_id TEXT NOT NULL REFERENCES comments(id),
  visitor TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (comment_id, visitor)
);
CREATE INDEX IF NOT EXISTS idx_reports_visitor ON reports(visitor, created_at);
