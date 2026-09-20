import { consultar, ejecutar } from './database.js';

export function listarGrupos() {
  return consultar(`
    SELECT g.id, g.nombre, g.color, COUNT(c.id) AS total
    FROM grupos g
    LEFT JOIN contactos c ON c.grupo_id = g.id
    GROUP BY g.id
    ORDER BY g.nombre COLLATE NOCASE`);
}

export function crearGrupo(nombre, color) {
  ejecutar('INSERT INTO grupos (nombre, color) VALUES (?, ?)', [nombre.trim(), color]);
}

/* Si el grupo tiene contactos, la clave foránea rechaza el borrado */
export function eliminarGrupo(id) {
  ejecutar('DELETE FROM grupos WHERE id = ?', [id]);
}
