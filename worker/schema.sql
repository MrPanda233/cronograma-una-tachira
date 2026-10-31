-- Base de datos de comentarios (Cloudflare D1: cronograma-comentarios).
-- `visitor` es una huella cifrada: nunca se guarda la IP.

-- Clave de firmas del servidor. La crea el Worker; nunca sale por la API.
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Captchas ya usados: cada uno sirve para un solo intento.
CREATE TABLE IF NOT EXISTS captcha_used (
  nonce TEXT PRIMARY KEY,
  visitor TEXT NOT NULL,
  ok INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_captcha_visitor ON captcha_used(visitor, ok, expires_at);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES comments(id),
  nick TEXT NOT NULL,
  tag TEXT NOT NULL,
  seq INTEGER NOT NULL DEFAULT 1,
  body TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  visitor TEXT NOT NULL,
  owner TEXT,
  ip_hash TEXT,
  created_at INTEGER NOT NULL,
  edited_at INTEGER,
  edits INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'visible'
);
CREATE INDEX IF NOT EXISTS idx_comments_list ON comments(status, parent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_visitor ON comments(visitor, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_fingerprint ON comments(fingerprint, created_at);
CREATE INDEX IF NOT EXISTS idx_comments_owner ON comments(owner);

-- Una reacción por persona, como en WhatsApp.
CREATE TABLE IF NOT EXISTS reactions (
  comment_id TEXT NOT NULL REFERENCES comments(id),
  visitor TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (comment_id, visitor)
);
CREATE INDEX IF NOT EXISTS idx_reactions_visitor ON reactions(visitor, created_at);

-- Un reporte por comentario y por IP cifrada.
CREATE TABLE IF NOT EXISTS reports (
  comment_id TEXT NOT NULL REFERENCES comments(id),
  visitor TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (comment_id, visitor)
);
CREATE INDEX IF NOT EXISTS idx_reports_visitor ON reports(visitor, created_at);

-- Nombre fijo de cada navegador.
CREATE TABLE IF NOT EXISTS identities (
  id TEXT PRIMARY KEY,
  device TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  nick TEXT NOT NULL,
  tag TEXT NOT NULL,
  seq INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_identities_device ON identities(device, created_at);

-- Último número usado de cada nombre: Búho del TSP, Búho del TSP 2, 3...
CREATE TABLE IF NOT EXISTS nick_counters (
  nick TEXT PRIMARY KEY,
  last INTEGER NOT NULL
);

-- Registro de lo que hizo la moderación automática.
CREATE TABLE IF NOT EXISTS moderation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id TEXT NOT NULL,
  action TEXT NOT NULL,
  reports INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- Vista para el administrador: SELECT * FROM reportes;
CREATE VIEW IF NOT EXISTS reportes AS
SELECT
  c.id AS comentario,
  c.nick AS nombre,
  c.seq AS numero,
  c.body AS texto,
  CASE c.status WHEN 'hidden' THEN 'retirado' WHEN 'deleted' THEN 'eliminado por su autor' ELSE 'visible' END AS estado,
  COUNT(r.visitor) AS reportes,
  datetime(MAX(r.created_at) / 1000, 'unixepoch') AS ultimo_reporte
FROM reports r
JOIN comments c ON c.id = r.comment_id
GROUP BY c.id
ORDER BY MAX(r.created_at) DESC;
