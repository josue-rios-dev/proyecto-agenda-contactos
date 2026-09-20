import { btnPrimario, tarjeta } from '../ui.js';

/* E4: estado vacío con mensaje propio y una acción que resuelve la situación */
export default function EstadoVacio({ titulo, descripcion, accion, onAccion }) {
  return (
    <div className={`${tarjeta} py-10 text-center`} role="status">
      <h2 className="text-base font-semibold">{titulo}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{descripcion}</p>
      <button type="button" onClick={onAccion} className={`${btnPrimario} mt-4`}>
        {accion}
      </button>
    </div>
  );
}
