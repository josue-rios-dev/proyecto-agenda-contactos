import { consultar, ejecutar } from './database.js';

/* E6: cada vez que se abre WhatsApp desde una tarjeta */
export function registrarMensaje(contactoId, texto) {
  ejecutar('INSERT INTO mensajes (contacto_id, texto) VALUES (?, ?)', [contactoId, texto]);
}

/* E9: plantillas guardadas en la base */
export function listarPlantillas() {
  return consultar('SELECT id, nombre, texto FROM plantillas ORDER BY id');
}

export function actualizarPlantilla(id, texto) {
  ejecutar('UPDATE plantillas SET texto = ? WHERE id = ?', [texto, id]);
}
