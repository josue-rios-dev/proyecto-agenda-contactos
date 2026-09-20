import { useState } from 'react';
import { useContactos } from './hooks/useContactos.js';
import ContactoForm from './components/ContactoForm.jsx';
import ContactoCard from './components/ContactoCard.jsx';
import DialogoConfirmar from './components/DialogoConfirmar.jsx';
import AvisoDuplicado from './components/AvisoDuplicado.jsx';
import MensajeModal from './components/MensajeModal.jsx';
import GruposPanel from './components/GruposPanel.jsx';
import Estadisticas from './components/Estadisticas.jsx';
import Respaldo from './components/Respaldo.jsx';
import EstadoVacio from './components/EstadoVacio.jsx';
import { ORDENES } from './db/contactosRepo.js';
import { buscarSimilares } from './utils/similitud.js';
import { enlaceWhatsApp } from './utils/contacto.js';
import { campo } from './ui.js';

const enfocarNombre = () => document.getElementById('campo-nombre')?.focus();

export default function App() {
  const h = useContactos();
  const [editando, setEditando] = useState(null);   // contacto que se edita
  const [aBorrar, setABorrar] = useState(null);     // E2: contacto pendiente de borrar
  const [aEscribir, setAEscribir] = useState(null); // contacto al que se le escribe
  const [duplicado, setDuplicado] = useState(null); // E11: { form, similares }
  const [claveForm, setClaveForm] = useState(0);    // reinicia el formulario tras resolver un duplicado

  if (h.falla) {
    return (
      <main className="grid min-h-screen place-items-center p-4">
        <p role="alert" className="max-w-md text-center text-sm text-red-700">
          No se pudo iniciar la base de datos: {h.falla}
        </p>
      </main>
    );
  }
  if (!h.listos) {
    return (
      <main className="grid min-h-screen place-items-center p-4">
        <p role="status" className="text-sm text-slate-500">Cargando la base de datos…</p>
      </main>
    );
  }

  /* ---------- acciones ---------- */
  const guardar = (form) => {
    if (editando) {
      const ok = h.actualizar(editando.id, form);
      if (ok) setEditando(null);
      return ok;
    }
    const similares = buscarSimilares(form, h.todos());
    if (similares.length > 0) {
      setDuplicado({ form, similares });
      return false; // el formulario conserva lo escrito hasta que el usuario decida
    }
    return h.crear(form);
  };

  const resolverDuplicado = (accion) => {
    const ok = accion(duplicado.form);
    setDuplicado(null);
    if (ok) setClaveForm((k) => k + 1);
  };

  const editar = (c) => {
    setEditando(c);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(enfocarNombre, 0);
  };

  const confirmarBorrado = () => {
    h.eliminar(aBorrar.id);
    if (editando?.id === aBorrar.id) setEditando(null);
    setABorrar(null);
  };

  const enviarMensaje = (texto) => {
    h.registrarMensaje(aEscribir.id, texto); // E6: queda en el historial
    window.open(enlaceWhatsApp(aEscribir.telefono, texto), '_blank', 'noopener,noreferrer');
    setAEscribir(null);
  };

  const hayFiltros = h.texto.trim() !== '' || h.grupoId !== 0;
  const limpiarFiltros = () => { h.setTexto(''); h.setGrupoId(0); };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <a href="#listado"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm">
        Saltar al listado de contactos
      </a>

      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <h1 className="text-lg font-semibold">Agenda de contactos</h1>
          <p className="text-xs text-slate-500">React · Tailwind CSS · SQLite en el navegador</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[22rem_1fr]">
        {/* ---------- columna de gestión ---------- */}
        <aside className="min-w-0 space-y-4">
          <ContactoForm
            key={claveForm}
            editando={editando}
            grupos={h.grupos}
            onGuardar={guardar}
            onCancelar={() => setEditando(null)}
          />
          <GruposPanel grupos={h.grupos} onCrear={h.crearGrupo} onEliminar={h.eliminarGrupo} />
          <Estadisticas contactos={h.contactos} />
          <Respaldo onImportado={() => { setEditando(null); limpiarFiltros(); h.refrescar(); }} />
        </aside>

        {/* ---------- listado ---------- */}
        <main id="listado" className="min-w-0 space-y-3" tabIndex={-1}>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <div>
              <label htmlFor="buscar" className="sr-only">Buscar por nombre, apellido o teléfono</label>
              <input id="buscar" type="search" className={campo} placeholder="Buscar por nombre o teléfono"
                value={h.texto} onChange={(e) => h.setTexto(e.target.value)} />
            </div>
            <div>
              <label htmlFor="filtro-grupo" className="sr-only">Filtrar por grupo</label>
              <select id="filtro-grupo" className={campo} value={h.grupoId}
                onChange={(e) => h.setGrupoId(Number(e.target.value))}>
                <option value={0}>Todos los grupos</option>
                {h.grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="orden" className="sr-only">Ordenar contactos</label>
              <select id="orden" className={campo} value={h.orden} onChange={(e) => h.setOrden(e.target.value)}>
                {Object.entries(ORDENES).map(([clave, o]) => <option key={clave} value={clave}>{o.etiqueta}</option>)}
              </select>
            </div>
          </div>

          {h.error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {h.error}
            </p>
          )}

          {h.contactos.length > 0 && (
            <p role="status" className="text-xs text-slate-600">
              Mostrando {h.contactos.length} de {h.total} {h.total === 1 ? 'contacto' : 'contactos'}
            </p>
          )}

          {h.contactos.length === 0 && (h.total === 0
            ? <EstadoVacio
                titulo="Tu agenda está vacía"
                descripcion="Todavía no guardaste ningún contacto. Completa el formulario para agregar el primero."
                accion="Agregar mi primer contacto"
                onAccion={enfocarNombre} />
            : <EstadoVacio
                titulo="Sin resultados"
                descripcion={hayFiltros
                  ? 'Ningún contacto coincide con tu búsqueda o con el grupo elegido.'
                  : 'No hay contactos para mostrar.'}
                accion="Limpiar búsqueda y filtros"
                onAccion={limpiarFiltros} />
          )}

          <ul className="space-y-3">
            {h.contactos.map((c) => (
              <li key={c.id}>
                <ContactoCard
                  c={c}
                  onEditar={editar}
                  onEliminar={setABorrar}
                  onFavorito={h.favorito}
                  onMensaje={setAEscribir}
                />
              </li>
            ))}
          </ul>
        </main>
      </div>

      {/* ---------- diálogos ---------- */}
      {aBorrar && (
        <DialogoConfirmar
          titulo="Eliminar contacto"
          mensaje={`¿Eliminar a ${aBorrar.nombre} ${aBorrar.apellido}? También se borrará su historial de mensajes. Esta acción no se puede deshacer.`}
          textoAceptar="Eliminar"
          onAceptar={confirmarBorrado}
          onCancelar={() => setABorrar(null)}
        />
      )}

      {duplicado && (
        <AvisoDuplicado
          similares={duplicado.similares}
          onGuardarIgual={() => resolverDuplicado(h.crear)}
          onFusionar={(id) => resolverDuplicado((f) => h.fusionar(id, f))}
          onCancelar={() => setDuplicado(null)}
        />
      )}

      {aEscribir && (
        <MensajeModal
          contacto={aEscribir}
          plantillas={h.plantillas}
          onCerrar={() => setAEscribir(null)}
          onEnviar={enviarMensaje}
          onGuardarPlantilla={h.guardarPlantilla}
        />
      )}
    </div>
  );
}
