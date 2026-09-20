import { useState } from 'react';
import { compartirContacto, descargarVCard } from '../utils/contacto.js';
import { formatearFecha, formatearFechaHora } from '../utils/fechas.js';
import { btnSecundario, btnPeligro, foco } from '../ui.js';

const AVISOS = {
  compartido: 'Contacto compartido.',
  copiado: 'Datos copiados al portapapeles.',
  error: 'No se pudo compartir ni copiar.'
};

export default function ContactoCard({ c, onEditar, onEliminar, onFavorito, onMensaje }) {
  const [aviso, setAviso] = useState('');
  const iniciales = (c.nombre[0] + (c.apellido?.[0] ?? '')).toUpperCase();
  const nombreCompleto = `${c.nombre} ${c.apellido}`.trim();

  const compartir = async () => {
    const r = await compartirContacto(c);
    setAviso(AVISOS[r] ?? '');
  };

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm hover:shadow-md">
      <div className="flex items-start gap-3">
        <div aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-100 font-semibold text-blue-700">
          {iniciales}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{nombreCompleto}</h3>
          <p className="text-sm text-slate-500">{c.telefono}</p>
          {c.email && <p className="truncate text-sm text-slate-500">{c.email}</p>}
          <span
            className="mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-medium"
            style={{ color: c.grupo_color, borderColor: c.grupo_color, backgroundColor: `${c.grupo_color}1a` }}
          >
            {c.grupo_nombre}
          </span>
          {c.cumple && (
            <p className="mt-1 text-xs text-slate-500">Cumpleaños: {formatearFecha(c.cumple)}</p>
          )}
          {c.ultimo_mensaje && (
            <p className="text-xs text-slate-500">Último mensaje: {formatearFechaHora(c.ultimo_mensaje)}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onFavorito(c.id)}
          aria-pressed={!!c.favorito}
          aria-label={c.favorito ? `Quitar a ${c.nombre} de favoritos` : `Marcar a ${c.nombre} como favorito`}
          title="Favorito"
          className={`rounded p-1 text-2xl leading-none ${foco} ${c.favorito ? 'text-amber-600' : 'text-slate-500'}`}
        >
          ★
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => onMensaje(c)}
          aria-label={`Escribir por WhatsApp a ${c.nombre}`}
          className={`rounded-lg bg-whatsapp px-3 py-1.5 text-xs font-medium text-slate-900 hover:opacity-90 ${foco}`}>
          Escribir por WhatsApp
        </button>
        <button type="button" onClick={compartir} className={btnSecundario}
          aria-label={`Compartir a ${c.nombre}`}>Compartir</button>
        <button type="button" onClick={() => descargarVCard(c)} className={btnSecundario}
          aria-label={`Descargar tarjeta vCard de ${c.nombre}`}>Descargar .vcf</button>
        <button type="button" onClick={() => onEditar(c)} className={btnSecundario}
          aria-label={`Editar a ${c.nombre}`}>Editar</button>
        <button type="button" onClick={() => onEliminar(c)} className={btnPeligro}
          aria-label={`Eliminar a ${c.nombre}`}>Eliminar</button>
      </div>

      {aviso && <p role="status" className="mt-2 text-xs text-slate-500">{aviso}</p>}
    </article>
  );
}
