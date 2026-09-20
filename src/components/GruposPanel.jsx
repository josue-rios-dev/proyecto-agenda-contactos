import { useState } from 'react';
import { campo, btnPrimario, btnPeligro, tarjeta } from '../ui.js';

/* E5: el usuario crea y elimina sus propios grupos */
export default function GruposPanel({ grupos, onCrear, onEliminar }) {
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState('#1d4ed8');

  const crear = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    if (onCrear(nombre, color)) setNombre('');
  };

  return (
    <section className={`${tarjeta} space-y-3`} aria-labelledby="titulo-grupos">
      <h2 id="titulo-grupos" className="text-base font-semibold">Grupos</h2>

      <ul className="space-y-1">
        {grupos.map((g) => (
          <li key={g.id} className="flex items-center gap-2 text-sm">
            <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: g.color }} />
            <span className="min-w-0 flex-1 truncate">{g.nombre}</span>
            <span className="text-xs text-slate-500">{g.total} {g.total === 1 ? 'contacto' : 'contactos'}</span>
            <button type="button" onClick={() => onEliminar(g.id)} className={btnPeligro}
              aria-label={`Eliminar el grupo ${g.nombre}`}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={crear} className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor="grupo-nombre" className="mb-1 block text-xs font-medium text-slate-600">Nuevo grupo</label>
          <input id="grupo-nombre" className={campo} value={nombre}
            onChange={(e) => setNombre(e.target.value)} autoComplete="off" />
        </div>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
          aria-label="Color del grupo" className="h-9 w-10 shrink-0 cursor-pointer rounded border border-slate-300" />
        <button type="submit" className={btnPrimario}>Crear</button>
      </form>
    </section>
  );
}
