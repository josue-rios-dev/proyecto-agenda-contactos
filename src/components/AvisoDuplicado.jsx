import Modal from './Modal.jsx';
import { btnPrimario, btnSecundario } from '../ui.js';

/* E11: se muestra cuando el contacto nuevo se parece a uno existente */
export default function AvisoDuplicado({ similares, onGuardarIgual, onFusionar, onCancelar }) {
  return (
    <Modal titulo="Este contacto se parece a otro" onCerrar={onCancelar} ancho="max-w-lg">
      <p className="text-sm text-slate-700">
        Antes de guardarlo, revisa si ya lo tienes en la agenda.
      </p>

      <ul className="mt-3 space-y-2">
        {similares.map(({ contacto: c, motivo }) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{c.nombre} {c.apellido}</p>
              <p className="text-xs text-slate-500">{c.telefono}</p>
              <p className="text-xs text-amber-700">{motivo}</p>
            </div>
            <button
              type="button"
              onClick={() => onFusionar(c.id)}
              className={btnSecundario}
              aria-label={`Fusionar con ${c.nombre} ${c.apellido}`}
            >
              Fusionar
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-slate-500">
        Fusionar conserva el contacto existente y solo completa sus campos vacíos
        (correo, notas y cumpleaños).
      </p>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button type="button" data-autofocus onClick={onCancelar} className={btnSecundario}>
          Volver al formulario
        </button>
        <button type="button" onClick={onGuardarIgual} className={btnPrimario}>
          Guardar como contacto nuevo
        </button>
      </div>
    </Modal>
  );
}
