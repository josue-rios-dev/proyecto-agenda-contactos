-- Datos iniciales: solo se cargan cuando la base nace vacía
INSERT INTO grupos (nombre, color) VALUES
  ('Personal', '#1d4ed8'),
  ('Trabajo',  '#b45309'),
  ('SENATI',   '#047857'),
  ('Familia',  '#be185d');

INSERT INTO plantillas (nombre, texto) VALUES
  ('Saludo',                 'Hola {nombre}, ¿cómo estás? Te escribo para saber de ti.'),
  ('Recordatorio de reunión','Hola {nombre}, te recuerdo nuestra reunión de mañana. ¿Me confirmas tu asistencia?'),
  ('Cobranza',               'Hola {nombre}, te escribo por el pago pendiente. ¿Podemos coordinar la fecha de hoy?');
