import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import ESQUEMA from './esquema.sql?raw';
import SEMILLA from './semilla.sql?raw';

const CLAVE = 'agenda_contactos_v2'; // v2: esquema con grupos, mensajes y plantillas
const TABLAS_REQUERIDAS = ['contactos', 'grupos', 'mensajes', 'plantillas'];

let SQL = null;
let db = null;
let promesaInicio = null;

/* ---- bytes <-> texto -------------------------------------------------
   String.fromCharCode(...bytes) revienta la pila cuando la base crece,
   por eso se convierte por trozos. */
const aBase64 = (bytes) => {
  let bin = '';
  const TROZO = 0x8000;
  for (let i = 0; i < bytes.length; i += TROZO) {
    bin += String.fromCharCode(...bytes.subarray(i, i + TROZO));
  }
  return btoa(bin);
};
const aBytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

/* Las claves foráneas son un ajuste de la conexión, no del archivo:
   hay que activarlas cada vez que se abre o se reabre la base. */
const activarClaves = () => db.run('PRAGMA foreign_keys = ON;');

async function arrancar() {
  SQL = await initSqlJs({ locateFile: () => wasmUrl });

  let guardada = null;
  try { guardada = localStorage.getItem(CLAVE); }
  catch (e) { console.warn('Sin acceso a localStorage', e); }

  let recuperada = null;
  if (guardada) {
    try { recuperada = new SQL.Database(aBytes(guardada)); }
    catch (e) { console.warn('La base guardada está dañada; se crea una nueva', e); }
  }

  const esNueva = !recuperada;
  db = recuperada ?? new SQL.Database();
  activarClaves();
  db.run(ESQUEMA);              // crea lo que falte (IF NOT EXISTS)
  if (esNueva) db.run(SEMILLA); // grupos y plantillas iniciales
  persistir();
  return db;
}

/* Una sola inicialización aunque React monte el efecto dos veces (StrictMode) */
export function iniciarDB() {
  promesaInicio ??= arrancar();
  return promesaInicio;
}

export function obtenerDB() {
  if (!db) throw new Error('Llama a iniciarDB() antes de consultar.');
  return db;
}

/* db.export() cierra y reabre la conexión: se pierde el PRAGMA foreign_keys.
   Por eso se reactiva justo después de exportar. */
function exportarBytes() {
  const bytes = obtenerDB().export();
  activarClaves();
  return bytes;
}

export function persistir() {
  const bytes = exportarBytes();
  try { localStorage.setItem(CLAVE, aBase64(bytes)); }
  catch (e) { console.warn('No se pudo guardar la base', e); }
}

/* ---- Ayudantes de consulta (los usan los repositorios) --------------- */

/* SELECT -> arreglo de objetos. Los valores viajan siempre como parámetros. */
export function consultar(sql, params) {
  const stmt = obtenerDB().prepare(sql);
  try {
    if (params !== undefined) stmt.bind(params);
    const filas = [];
    while (stmt.step()) filas.push(stmt.getAsObject());
    return filas;
  } finally {
    stmt.free(); // libera memoria del WASM
  }
}

/* INSERT / UPDATE / DELETE: ejecuta y guarda */
export function ejecutar(sql, params = []) {
  obtenerDB().run(sql, params);
  persistir();
}

/* ---- Copia de seguridad (E7) ----------------------------------------- */

/* Devuelve el archivo .db completo */
export function exportarArchivo() {
  return exportarBytes();
}

/* Reemplaza la base actual por otra, tras comprobar que es de esta agenda */
export function reemplazarDB(bytes) {
  const candidata = new SQL.Database(bytes);
  try {
    const res = candidata.exec("SELECT name FROM sqlite_master WHERE type = 'table'");
    const tablas = res[0]?.values.flat() ?? [];
    const faltan = TABLAS_REQUERIDAS.filter((t) => !tablas.includes(t));
    if (faltan.length) {
      throw new Error(`Archivo no válido: faltan las tablas ${faltan.join(', ')}.`);
    }
  } catch (e) {
    candidata.close();
    throw e.message?.startsWith('Archivo no válido')
      ? e
      : new Error('Archivo no válido: no es una base SQLite.');
  }
  db?.close();
  db = candidata;
  activarClaves();
  persistir();
}
