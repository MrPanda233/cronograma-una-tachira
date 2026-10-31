-- Migración de la base ya publicada: identidad por navegador, editar y eliminar,
-- una reacción por persona y registro de moderación. Conserva comentarios y reportes.

ALTER TABLE comments ADD COLUMN owner TEXT;
ALTER TABLE comments ADD COLUMN ip_hash TEXT;
ALTER TABLE comments ADD COLUMN edited_at INTEGER;
ALTER TABLE comments ADD COLUMN edits INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_comments_owner ON comments(owner);

CREATE TABLE IF NOT EXISTS identities (
  id TEXT PRIMARY KEY,
  device TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  nick TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_identities_device ON identities(device, created_at);

-- Una reacción por persona: la clave pasa a ser (comentario, visitante).
DROP TABLE IF EXISTS reactions;
CREATE TABLE reactions (
  comment_id TEXT NOT NULL REFERENCES comments(id),
  visitor TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (comment_id, visitor)
);
CREATE INDEX IF NOT EXISTS idx_reactions_visitor ON reactions(visitor, created_at);

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
  c.tag AS etiqueta,
  c.body AS texto,
  CASE c.status WHEN 'hidden' THEN 'retirado' WHEN 'deleted' THEN 'eliminado por su autor' ELSE 'visible' END AS estado,
  COUNT(r.visitor) AS reportes,
  datetime(MAX(r.created_at) / 1000, 'unixepoch') AS ultimo_reporte
FROM reports r
JOIN comments c ON c.id = r.comment_id
GROUP BY c.id
ORDER BY MAX(r.created_at) DESC;
