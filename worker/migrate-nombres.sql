-- Migración de la base ya publicada: nombres únicos con número (Búho del TSP 2, 3...).
-- Quien ya tiene nombre conserva el número 1.

ALTER TABLE identities ADD COLUMN seq INTEGER NOT NULL DEFAULT 1;
ALTER TABLE comments ADD COLUMN seq INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS nick_counters (
  nick TEXT PRIMARY KEY,
  last INTEGER NOT NULL
);
INSERT OR IGNORE INTO nick_counters (nick, last) SELECT DISTINCT nick, 1 FROM identities;

DROP VIEW IF EXISTS reportes;
CREATE VIEW reportes AS
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
