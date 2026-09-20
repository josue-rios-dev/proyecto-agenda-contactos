import { useState, useEffect, useId } from 'react';
import { campo, btnPrimario, btnSecundario, tarjeta } from '../ui.js';

const VACIO = {
  nombre: '', apellido: '', telefono: '', email: '',
  grupo_id: '', favorito: false, notas: '', cumple: ''
};

/* Etiqueta visible + mensaje de error enlazado al campo (accesibilidad) */
function Campo({ etiqueta, error, id: idFijo, children }) {
  const generado = useId();
  const id = idFijo ?? generado;
  const idError = error ? `${id}-error` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600">{etiqueta}</label>
      {children(id, idError)}
      {error && <p id={idError} role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ContactoForm({ editando, grupos, onGuardar, onCancelar }) {
  const [form, setForm] = useState(VACIO);
  const [fallos, setFallos] = useState({});

  useEffect(() => {
    setForm(editando
      ? {
          ...editando,
          favorito: !!editando.favorito,
          apellido: editando.apellido ?? '',
          email: editando.email ?? '',
          notas: editando.notas ?? '',
          cumple: editando.cumple ?? ''
        }
      : VACIO);
    setFallos({});
  }, [editando]);

  // Mientras el usuario no elija, vale el primer grupo de la lista
  const grupoActual = form.grupo_id || grupos[0]?.id || '';

  const cambiar = (nombre) => (e) =>
    setForm({ ...form, [nombre]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const validar = () => {
    const f = {};
    if (!form.nombre.trim()) f.nombre = 'Escribe el nombre';
    if (!/^[0-9+\s]{6,15}$/.test(form.telefono)) f.telefono = 'Teléfono no válido (solo números, espacios y +)';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) f.email = 'Correo no válido';
    if (!grupoActual) f.grupo = 'Crea un grupo primero';
    setFallos(f);
    return Object.keys(f).length === 0;
  };

  const enviar = (e) => {
    e.preventDefault();
    if (!validar()) return;
    const guardado = onGuardar({ ...form, grupo_id: Number(grupoActual) });
    if (guardado && !editando) setForm(VACIO);
  };

  const hoy = new Date().toISOString().slice(0, 10);
  const atributos = (id, idError, invalido) => ({
    id, 'aria-invalid': invalido ? 'true' : undefined, 'aria-describedby': idError
  });

  return (
    <form onSubmit={enviar} noValidate className={`${tarjeta} space-y-3`}>
      <h2 className="text-base font-semibold">
        {editando ? 'Editar contacto' : 'Nuevo contacto'}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <Campo etiqueta="Nombre" error={fallos.nombre} id="campo-nombre">
          {(id, e) => <input className={campo} {...atributos(id, e, fallos.nombre)}
            value={form.nombre} onChange={cambiar('nombre')} autoComplete="off" />}
        </Campo>

        <Campo etiqueta="Apellido">
          {(id) => <input className={campo} id={id}
            value={form.apellido} onChange={cambiar('apellido')} autoComplete="off" />}
        </Campo>

        <Campo etiqueta="Teléfono" error={fallos.telefono}>
          {(id, e) => <input className={campo} {...atributos(id, e, fallos.telefono)}
            inputMode="tel" placeholder="965123456"
            value={form.telefono} onChange={cambiar('telefono')} />}
        </Campo>

        <Campo etiqueta="Correo (opcional)" error={fallos.email}>
          {(id, e) => <input className={campo} {...atributos(id, e, fallos.email)}
            type="email" value={form.email} onChange={cambiar('email')} />}
        </Campo>

        <Campo etiqueta="Grupo" error={fallos.grupo}>
          {(id, e) => (
            <select className={campo} {...atributos(id, e, fallos.grupo)}
              value={grupoActual} onChange={cambiar('grupo_id')}>
              {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
          )}
        </Campo>

        {/* E1: cumpleaños. Se guarda en ISO (aaaa-mm-dd), que es lo que entrega el input date */}
        <Campo etiqueta="Cumpleaños (opcional)">
          {(id) => <input className={campo} id={id} type="date" max={hoy}
            value={form.cumple} onChange={cambiar('cumple')} />}
        </Campo>
      </div>

      <Campo etiqueta="Notas (opcional)">
        {(id) => <textarea className={campo} id={id} rows={2}
          value={form.notas} onChange={cambiar('notas')} />}
      </Campo>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.favorito} onChange={cambiar('favorito')} />
        Marcar como favorito
      </label>

      <div className="flex flex-wrap gap-2">
        <button type="submit" className={btnPrimario}>
          {editando ? 'Guardar cambios' : 'Agregar contacto'}
        </button>
        {editando && (
          <button type="button" onClick={onCancelar}
            className={`${btnSecundario} px-4 py-2 text-sm`}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
