-- ============================================================================
--  CONTACTOS DE EJEMPLO  ·  edita este archivo en VS Code
-- ============================================================================
--  Después de cambiarlo, ejecuta en la terminal:   npm run generar-db
--  Eso crea de nuevo agenda.db. Luego impórtalo en la app (Copia de seguridad
--  → Importar…).
--
--  Reglas (las revisa la base de datos; si algo falla, el comando te lo dice):
--    · telefono  → único en toda la agenda (no repitas ninguno)
--    · grupo     → 'Personal', 'Trabajo', 'SENATI' o 'Familia'
--                  (los grupos nuevos se crean en la app, no aquí)
--    · favorito  → 1 = sí, 0 = no
--    · cumple    → 'aaaa-mm-dd' entre comillas, o NULL si no tiene
--    · creado_en → 'aaaa-mm-dd hh:mm:ss'
--    · el texto va entre comillas simples; si lleva una comilla, dóblala: 'D''Angelo'
--  Deja al menos 10 contactos: es lo que pide el manual.
-- ============================================================================

INSERT INTO contactos
  (nombre,  apellido,  telefono,    email,                      grupo_id,                                      favorito, notas,                                          cumple,       creado_en)
VALUES
  ('Goku',   'Suarez',    '900000001', 'goku.saya@example.com',     (SELECT id FROM grupos WHERE nombre='SENATI'),   1, 'Compañera de laboratorio de Ingeniería de Software', '2005-03-15', '2026-08-01 09:10:00'),
  ('Vegueta',  'Rojas',  '900000002', 'vegueta.prince@example.com',  (SELECT id FROM grupos WHERE nombre='SENATI'),   0, 'Instructor de Base de Datos',                       '1985-11-02', '2026-08-02 10:30:00'),
  ('Tronks', 'Quispe',  '900000003', '',                         (SELECT id FROM grupos WHERE nombre='Familia'),  1, 'Mamá',                                                '1970-05-21', '2026-08-03 08:00:00'),
  ('Gojan','Pérez',   '900000004', 'gojan.perez@example.com', (SELECT id FROM grupos WHERE nombre='Trabajo'),  0, 'Cliente del proyecto de tienda online',                NULL,         '2026-08-05 15:45:00'),
  ('Goten',  'Vargas',    '900000005', 'goten.vargas@example.com',    (SELECT id FROM grupos WHERE nombre='Trabajo'),  0, 'Contabilidad',                                        NULL,         '2026-08-10 11:20:00'),
  ('Bulma', 'Salazar', '900000006', '',                         (SELECT id FROM grupos WHERE nombre='Personal'), 0, 'Amigo del colegio',                                   '2004-12-09', '2026-08-12 19:05:00'),
  ('Saitama', 'Mendoza', '900000007', 'saitama.m@example.com',      (SELECT id FROM grupos WHERE nombre='Personal'), 1, '',                                                    '2006-07-30', '2026-08-15 13:00:00'),
  ('Freezer', 'Flores',  '900000008', '',                         (SELECT id FROM grupos WHERE nombre='SENATI'),   0, 'Grupo de estudio de los jueves',                      NULL,         '2026-08-20 17:40:00'),
  ('Picoro', 'Castro',  '900000009', 'picoro.castro@example.com', (SELECT id FROM grupos WHERE nombre='Familia'),  0, 'Tía',                                                 '1978-02-14', '2026-09-01 12:15:00'),
  ('Majimbu', 'Lazo',    '900000010', 'majim.lazo@example.com',   (SELECT id FROM grupos WHERE nombre='Trabajo'),  0, 'Proveedor de hosting',                                NULL,         '2026-09-10 16:30:00');

-- Historial de mensajes de ejemplo (E6). Se enlaza con el contacto por su teléfono:
-- si cambias un teléfono arriba, cámbialo también aquí (o borra estas líneas).
INSERT INTO mensajes (contacto_id, texto, enviado_en) VALUES
  ((SELECT id FROM contactos WHERE telefono='900000001'), 'Hola Goku, ¿cómo estás? Te escribo para saber si derrotaste a Cel.',                             '2026-09-12 18:20:00'),
  ((SELECT id FROM contactos WHERE telefono='900000001'), 'Hola Goku, te recuerdo que debemos volvernos más fuertes', '2026-09-16 20:05:00'),
  ((SELECT id FROM contactos WHERE telefono='900000004'), 'Hola Gojan, ¿podemos coordinar las estrategias?',                          '2026-09-14 09:30:00');
