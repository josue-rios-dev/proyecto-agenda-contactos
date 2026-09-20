import { useMemo } from 'react';
import { obtenerEstadisticas } from '../db/estadisticas.js';
import { formatearFechaHora } from '../utils/fechas.js';
import { tarjeta } from '../ui.js';

/* E8: `contactos` solo sirve para recalcular cuando algo cambia en la base */
export default function Estadisticas({ contactos }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const e = useMemo(() => obtenerEstadisticas(), [contactos]);
  const mayor = Math.max(1, ...e.porGrupo.map((g) => g.total));

  return (
    <section className={`${tarjeta} space-y-3`} aria-labelledby="titulo-estadisticas">
      <h2 id="titulo-estadisticas" className="text-base font-semibold">Estadísticas</h2>

      <dl className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg bg-slate-50 p-2">
          <dd className="text-xl font-semibold">{e.total}</dd>
          <dt className="text-xs text-slate-500">Contactos</dt>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <dd className="text-xl font-semibold">{e.favoritos}</dd>
          <dt className="text-xs text-slate-500">Favoritos</dt>
        </div>
      </dl>

      <ul className="space-y-2">
        {e.porGrupo.map((g) => (
          <li key={g.nombre} className="text-xs">
            <div className="flex justify-between">
              <span className="truncate">{g.nombre}</span>
              <span className="text-slate-500">{g.total}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-slate-100" aria-hidden="true">
              <div className="h-2 rounded-full" style={{ width: `${(g.total / mayor) * 100}%`, backgroundColor: g.color }} />
            </div>
          </li>
        ))}
      </ul>

      <p className="text-xs text-slate-500">
        {e.masAntiguo
          ? `Contacto más antiguo: ${e.masAntiguo.nombre} ${e.masAntiguo.apellido} (${formatearFechaHora(e.masAntiguo.creado_en)})`
          : 'Aún no hay contactos.'}
      </p>
    </section>
  );
}
