import Modal from './Modal.jsx';
import { btnSecundario, btnPeligroSolido } from '../ui.js';

/* E2: confirmación reutilizable, sin window.confirm */
export default function DialogoConfirmar({
  mensaje, onAceptar, onCancelar, titulo = 'Confirmar', textoAceptar = 'Aceptar'
}) {
  return (
    <Modal titulo={titulo} onCerrar={onCancelar}>
      <p className="break-words text-sm text-slate-700">{mensaje}</p>
      <div className="mt-4 flex justify-end gap-2">
        {/* El foco inicial cae en Cancelar: la opción segura */}
        <button type="button" data-autofocus onClick={onCancelar} className={btnSecundario}>
          Cancelar
        </button>
        <button type="button" onClick={onAceptar} className={btnPeligroSolido}>
          {textoAceptar}
        </button>
      </div>
    </Modal>
  );
}
