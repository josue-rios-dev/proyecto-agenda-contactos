import { consultar } from './database.js';

/* E8: todo sale de consultas SQL, ningún dato se calcula recorriendo arreglos */
export function obtenerEstadisticas() {
  // Total de contactos y cuántos son favoritos (COUNT ignora los NULL del CASE)
  const [{ total, favoritos }] = consultar(`
    SELECT COUNT(*)                                 AS total,
           COUNT(CASE WHEN favorito = 1 THEN 1 END) AS favoritos
    FROM contactos`);

  // Reparto por grupo; LEFT JOIN para que los grupos vacíos aparezcan con 0
  const porGrupo = consultar(`
    SELECT g.nombre, g.color, COUNT(c.id) AS total
    FROM grupos g
    LEFT JOIN contactos c ON c.grupo_id = g.id
    GROUP BY g.id
    ORDER BY total DESC, g.nombre COLLATE NOCASE`);

  // Contacto más antiguo: el que tiene la fecha MIN(creado_en)
  const masAntiguo = consultar(`
    SELECT nombre, apellido, creado_en
    FROM contactos
    WHERE creado_en = (SELECT MIN(creado_en) FROM contactos)
    ORDER BY id
    LIMIT 1`)[0] ?? null;

  return { total, favoritos, porGrupo, masAntiguo };
}
