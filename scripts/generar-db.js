/* Genera agenda.db a partir de archivos de texto que sí puedes editar en VS Code:
     src/db/esquema.sql            → tablas
     src/db/semilla.sql            → grupos y plantillas iniciales
     datos/contactos-ejemplo.sql   → contactos y mensajes de ejemplo
   Uso:  npm run generar-db */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import initSqlJs from 'sql.js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = (ruta) => fs.readFileSync(path.join(raiz, ruta), 'utf8');

const SQL = await initSqlJs();
const db = new SQL.Database();

try {
  db.run('PRAGMA foreign_keys = ON;');
  db.run(leer('src/db/esquema.sql'));
  db.run(leer('src/db/semilla.sql'));
  db.run(leer('datos/contactos-ejemplo.sql'));
} catch (e) {
  const m = String(e.message);
  console.error('\nNo se pudo generar agenda.db:', m);
  if (m.includes('UNIQUE')) console.error('→ Hay un teléfono repetido en datos/contactos-ejemplo.sql.');
  if (m.includes('NOT NULL')) console.error('→ Falta un dato obligatorio (nombre, teléfono o un grupo que exista).');
  if (m.includes('CHECK')) console.error('→ Revisa el formato de cumple (aaaa-mm-dd) y favorito (0 o 1).');
  if (m.includes('syntax')) console.error('→ Falta una coma, una comilla o un punto y coma en el archivo .sql.');
  process.exit(1);
}

const total = db.exec('SELECT COUNT(*) FROM contactos')[0].values[0][0];
fs.writeFileSync(path.join(raiz, 'agenda.db'), Buffer.from(db.export()));
console.log(`agenda.db generado con ${total} contactos.`);
if (total < 10) console.warn('Aviso: el manual pide al menos 10 contactos.');
