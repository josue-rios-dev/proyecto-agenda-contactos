import { consultar, ejecutar } from './database.js';

/* E3: el nombre de una columna no puede viajar como parámetro (?).
   Cada opción elegida en pantalla se traduce a un fragmento SQL autorizado
   de este diccionario; nunca se concatena texto escrito por el usuario. */
export const ORDENES = {
  nombre: {
    etiqueta: 'Nombre A–Z (favoritos primero)',
    sql: 'c.favorito DESC, c.nombre COLLATE NOCASE ASC, c.apellido COLLATE NOCASE ASC'
  },
  recientes: {
    etiqueta: 'Más recientes primero',
    sql: 'c.creado_en DESC, c.id DESC'
  },
  grupo: {
    etiqueta: 'Por grupo',
    sql: 'g.nombre COLLATE NOCASE ASC, c.nombre COLLATE NOCASE ASC'
  }
};

/* ---------- LEER ---------- */
export function listarContactos({ texto = '', grupoId = 0, orden = 'nombre' } = {}) {
  const criterio = Object.hasOwn(ORDENES, orden) ? ORDENES[orden] : ORDENES.nombre;
  const sql = `
    SELECT c.*,
           g.nombre AS grupo_nombre,
           g.color  AS grupo_color,
           u.ultimo_mensaje
    FROM contactos c
    JOIN grupos g ON g.id = c.grupo_id
    LEFT JOIN (
      SELECT contacto_id, MAX(enviado_en) AS ultimo_mensaje
      FROM mensajes
      GROUP BY contacto_id
    ) u ON u.contacto_id = c.id
    WHERE (c.nombre LIKE $t OR c.apellido LIKE $t OR c.telefono LIKE $t)
      AND ($g = 0 OR c.grupo_id = $g)
    ORDER BY ${criterio.sql}`;
  return consultar(sql, { $t: `%${texto.trim()}%`, $g: Number(grupoId) });
}

export function contarContactos() {
  return consultar('SELECT COUNT(*) AS total FROM contactos')[0].total;
}

/* ---------- ESCRIBIR ---------- */
const valores = (c) => [
  c.nombre.trim(),
  (c.apellido ?? '').trim(),
  c.telefono.trim(),
  (c.email ?? '').trim(),
  Number(c.grupo_id),
  c.favorito ? 1 : 0,
  (c.notas ?? '').trim(),
  c.cumple || null
];

export function crearContacto(c) {
  ejecutar(
    `INSERT INTO contactos
       (nombre, apellido, telefono, email, grupo_id, favorito, notas, cumple)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    valores(c)
  );
}

export function actualizarContacto(id, c) {
  ejecutar(
    `UPDATE contactos
        SET nombre = ?, apellido = ?, telefono = ?, email = ?,
            grupo_id = ?, favorito = ?, notas = ?, cumple = ?
      WHERE id = ?`,
    [...valores(c), id]
  );
}

export function eliminarContacto(id) {
  // Sus mensajes se borran solos: ON DELETE CASCADE
  ejecutar('DELETE FROM contactos WHERE id = ?', [id]);
}

export function alternarFavorito(id) {
  ejecutar(
    'UPDATE contactos SET favorito = CASE favorito WHEN 1 THEN 0 ELSE 1 END WHERE id = ?',
    [id]
  );
}

/* E11: fusionar conserva el contacto existente y solo completa sus campos vacíos */
export function fusionarContactos(idExistente, nuevo) {
  ejecutar(
    `UPDATE contactos
        SET email  = CASE WHEN COALESCE(email, '') = '' THEN ? ELSE email END,
            notas  = CASE WHEN COALESCE(notas, '') = '' THEN ? ELSE notas END,
            cumple = COALESCE(cumple, ?)
      WHERE id = ?`,
    [(nuevo.email ?? '').trim(), (nuevo.notas ?? '').trim(), nuevo.cumple || null, idExistente]
  );
}
