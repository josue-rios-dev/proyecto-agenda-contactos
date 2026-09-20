import { useState, useEffect, useCallback } from 'react';
import { iniciarDB } from '../db/database.js';
import * as repo from '../db/contactosRepo.js';
import * as gruposRepo from '../db/gruposRepo.js';
import * as mensajesRepo from '../db/mensajesRepo.js';

/* Traduce el error técnico de SQLite a un mensaje que el usuario entiende */
function traducirError(e) {
  const m = String(e?.message ?? e);
  if (m.includes('UNIQUE') && m.includes('contactos.telefono')) return 'Ese número ya está registrado en la agenda.';
  if (m.includes('UNIQUE') && m.includes('grupos.nombre')) return 'Ya existe un grupo con ese nombre.';
  if (m.includes('UNIQUE')) return 'Ese dato ya existe y no puede repetirse.';
  if (m.includes('FOREIGN KEY')) return 'No se puede eliminar un grupo que todavía tiene contactos. Mueve los contactos a otro grupo primero.';
  if (m.includes('CHECK')) return 'Alguno de los datos no cumple las reglas de la base. Revisa la fecha y los campos.';
  return 'No se pudo guardar. Revisa los datos.';
}

export function useContactos() {
  const [listos, setListos] = useState(false);
  const [falla, setFalla] = useState('');
  const [contactos, setContactos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [total, setTotal] = useState(0);
  const [texto, setTexto] = useState('');
  const [grupoId, setGrupoId] = useState(0);   // 0 = todos los grupos
  const [orden, setOrden] = useState('nombre');
  const [error, setError] = useState('');

  const refrescar = useCallback(() => {
    setContactos(repo.listarContactos({ texto, grupoId, orden }));
    setTotal(repo.contarContactos());
    setGrupos(gruposRepo.listarGrupos());
    setPlantillas(mensajesRepo.listarPlantillas());
  }, [texto, grupoId, orden]);

  // 1. Arranca la base una sola vez
  useEffect(() => {
    iniciarDB()
      .then(() => setListos(true))
      .catch((e) => setFalla(String(e?.message ?? e)));
  }, []);

  // 2. Recarga los datos cuando cambian los filtros
  useEffect(() => { if (listos) refrescar(); }, [listos, refrescar]);

  // 3. Envuelve cada escritura para capturar errores de SQLite
  const ejecutar = (accion) => {
    try { accion(); setError(''); refrescar(); return true; }
    catch (e) { console.error(e); setError(traducirError(e)); return false; }
  };

  return {
    listos, falla, contactos, grupos, plantillas, total, error,
    texto, grupoId, orden,
    setTexto, setGrupoId, setOrden, refrescar,
    todos: () => repo.listarContactos(),
    crear: (c) => ejecutar(() => repo.crearContacto(c)),
    actualizar: (id, c) => ejecutar(() => repo.actualizarContacto(id, c)),
    eliminar: (id) => ejecutar(() => repo.eliminarContacto(id)),
    favorito: (id) => ejecutar(() => repo.alternarFavorito(id)),
    fusionar: (id, c) => ejecutar(() => repo.fusionarContactos(id, c)),
    crearGrupo: (nombre, color) => ejecutar(() => gruposRepo.crearGrupo(nombre, color)),
    eliminarGrupo: (id) => ejecutar(() => gruposRepo.eliminarGrupo(id)),
    registrarMensaje: (id, t) => ejecutar(() => mensajesRepo.registrarMensaje(id, t)),
    guardarPlantilla: (id, t) => ejecutar(() => mensajesRepo.actualizarPlantilla(id, t))
  };
}
