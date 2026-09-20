# Agenda de contactos · React + Tailwind CSS + SQLite

SENATI · Escuela de Tecnologías de la Información · Ingeniería de Software con Inteligencia Artificial · V ciclo

| | |
|---|---|
| **Apellidos y nombres** | Rios Gonzales, Josue |
| **Unidad didáctica** | Seminario de complementación práctica II |

| **Instructor** | Christian Alfredo Arevalo Jesus |
| **Fecha de entrega** | 18/09/2026 |

Aplicación web sin servidor: todo corre en el navegador y los datos viven en una base
SQLite real (sql.js, SQLite compilado a WebAssembly) que se guarda en `localStorage`.


## Instalación

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # pruebas de similitud (E11) e IA (E12)
npm run generar-db   # vuelve a crear agenda.db desde datos/contactos-ejemplo.sql
```

El proyecto incluye `package.json`, `vite.config.js` y `postcss.config.js`: basta con `npm install`.
`npm test` usa el ejecutor de pruebas de Node (Node 18 o superior).

Para "Sugerir mensaje" (E12) copia `.env.example` como `.env` y completa `VITE_ANTHROPIC_API_KEY`.
Sin clave, el resto de la aplicación funciona igual y el botón muestra un error claro.

## Datos de ejemplo

`agenda.db` (raíz del repositorio) es una base de ejemplo con 10 contactos ficticios.
Se carga desde **Copia de seguridad → Importar**.

No se edita a mano porque es un archivo binario. Se genera a partir de texto:

1. Se editan los contactos en `datos/contactos-ejemplo.sql`.
2. `npm run generar-db` ejecuta `src/db/esquema.sql`, `src/db/semilla.sql` y ese archivo con sql.js
   (`scripts/generar-db.js`) y exporta el resultado a `agenda.db`.
3. La app lo lee al importarlo. Los datos se copian al `localStorage` del navegador, por eso
   hay que importar de nuevo cada vez que se regenera el archivo.

## Arquitectura

```
Componente React  →  Hook useContactos  →  Repositorio (SQL)  →  SQLite (sql.js)
```

Ningún componente escribe SQL. Todo el SQL vive en `src/db/`.

| Carpeta | Contenido |
|---|---|
| `src/db/` | `esquema.sql`, `semilla.sql`, `database.js` (conexión y persistencia), un repositorio por tabla y `estadisticas.js` |
| `src/hooks/` | `useContactos.js`: estado, filtros y traducción de errores de SQLite |
| `src/components/` | Formulario, tarjeta, diálogos, grupos, estadísticas y respaldo |
| `src/utils/` | WhatsApp, vCard, fechas, plantillas y similitud (Levenshtein) |
| `src/servicios/` | Llamada al modelo de lenguaje (E12) |
| `datos/` | `contactos-ejemplo.sql`: contactos y mensajes de ejemplo, editables |
| `scripts/` | `generar-db.js`: crea `agenda.db` a partir de los archivos `.sql` |
| `docs/` | Reflexión sobre el uso de IA (E12) |

## Dónde está cada ejercicio

| Ejercicio | Dónde |
|---|---|
| E1 Cumpleaños | `esquema.sql` (columna `cumple` con `CHECK`), `ContactoForm.jsx`, `ContactoCard.jsx`, `utils/fechas.js` |
| E2 Confirmar antes de borrar | `components/DialogoConfirmar.jsx` (props `mensaje`, `onAceptar`, `onCancelar`) |
| E3 Orden configurable | `ORDENES` y `listarContactos` en `db/contactosRepo.js` |
| E4 Estados vacíos | `components/EstadoVacio.jsx` usado dos veces en `App.jsx` |
| E5 Grupos | `grupos` + `FOREIGN KEY` en `esquema.sql`, `JOIN` en `listarContactos`, `gruposRepo.js`, `GruposPanel.jsx` |
| E6 Historial de mensajes | tabla `mensajes`, `LEFT JOIN` con `MAX(enviado_en)` en `listarContactos` |
| E7 Copia de seguridad | `components/Respaldo.jsx`, `exportarArchivo` y `reemplazarDB` en `database.js` |
| E8 Estadísticas | `db/estadisticas.js` (consultas comentadas) y `Estadisticas.jsx` |
| E9 Plantillas | tabla `plantillas`, `MensajeModal.jsx`, `utils/plantillas.js` |
| E10 Accesibilidad | etiquetas, `aria-*`, foco visible, `Modal.jsx` con foco atrapado, enlace "Saltar al listado" |
| E11 Duplicados | `utils/similitud.js` y `similitud.test.js`, `AvisoDuplicado.jsx` |
| E12 Redacción asistida | `servicios/ia.js` (incluye el prompt), `MensajeModal.jsx`, `docs/reflexion-ia.md` |

## Decisiones de diseño

- **Repositorio + hook:** si mañana se cambia SQLite por una API REST, solo se reescribe `src/db/`.
- **Consultas parametrizadas:** los valores siempre viajan como parámetros (`?`, `$t`). El único
  fragmento SQL dinámico es el `ORDER BY`, y sale de un diccionario fijo (`ORDENES`), nunca del texto del usuario.
- **Errores traducidos:** `UNIQUE`, `FOREIGN KEY` y `CHECK` se convierten en mensajes para el usuario.
- **Teléfono como `TEXT`:** conserva el `+` y los ceros. La unicidad la garantiza la base, no solo el formulario.
- **Fechas en ISO (`aaaa-mm-dd`):** ordenan bien como texto; se convierten a `dd/mm/aaaa` solo al mostrarlas.
- **`ON DELETE CASCADE` en `mensajes`:** al borrar un contacto se borra su historial. En `grupos` no hay cascada:
  un grupo con contactos no se puede eliminar.
- **`agenda.db` reproducible:** se genera desde archivos `.sql` de texto, que se pueden leer, editar y comparar
  en Git, en vez de entregar un binario sin origen conocido.

## Diferencias respecto al manual (y por qué)

1. **`btoa` por trozos.** `String.fromCharCode(...bytes)` falla con "Maximum call stack size exceeded" cuando la base crece.
2. **`PRAGMA foreign_keys = ON` después de cada `export()`.** En sql.js, `db.export()` cierra y reabre la conexión,
   y con eso se pierde el PRAGMA. Como `persistir()` exporta tras cada escritura, sin este paso las claves
   foráneas dejarían de aplicarse después del primer guardado.
3. **`esquema.sql` con `?raw`** en lugar de un `esquema.js`.
4. **Clave `agenda_contactos_v2`** en `localStorage`, porque el esquema cambió respecto a la versión base.
5. **Texto oscuro en el botón de WhatsApp** y colores de grupo más oscuros: el blanco sobre `#25D366` no alcanza el
   contraste mínimo que mide Lighthouse.
6. **`<form>` real** en los formularios: se envían con Enter y los lectores de pantalla los anuncian bien.
