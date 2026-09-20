-- Esquema final: integra E1 (cumple), E5 (grupos), E6 (mensajes) y E9 (plantillas)

CREATE TABLE IF NOT EXISTS grupos (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE COLLATE NOCASE,
  color  TEXT NOT NULL DEFAULT '#2563eb'
);

CREATE TABLE IF NOT EXISTS contactos (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre    TEXT NOT NULL,
  apellido  TEXT NOT NULL DEFAULT '',
  telefono  TEXT NOT NULL UNIQUE,
  email     TEXT,
  grupo_id  INTEGER NOT NULL REFERENCES grupos(id),
  favorito  INTEGER NOT NULL DEFAULT 0 CHECK (favorito IN (0,1)),
  notas     TEXT,
  cumple    TEXT CHECK (cumple IS NULL
                     OR cumple GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  creado_en TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE INDEX IF NOT EXISTS idx_contactos_nombre ON contactos(nombre);
CREATE INDEX IF NOT EXISTS idx_contactos_grupo  ON contactos(grupo_id);

CREATE TABLE IF NOT EXISTS mensajes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  contacto_id INTEGER NOT NULL REFERENCES contactos(id) ON DELETE CASCADE,
  texto       TEXT NOT NULL,
  enviado_en  TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE INDEX IF NOT EXISTS idx_mensajes_contacto ON mensajes(contacto_id);

CREATE TABLE IF NOT EXISTS plantillas (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  texto  TEXT NOT NULL
);
