import { useState, useRef, useEffect } from 'react';
import Modal from './Modal.jsx';
import { reemplazarVariables } from '../utils/plantillas.js';
import { sugerirMensajes } from '../servicios/ia.js';
import { campo, btnPrimario, btnSecundario, foco } from '../ui.js';

const ERRORES_IA = {
  SIN_CLAVE: 'Falta configurar VITE_ANTHROPIC_API_KEY en el archivo .env.',
  FORMATO: 'El modelo devolvió una respuesta que no se pudo leer. Intenta de nuevo.'
};
const mensajeDeError = (e) =>
  ERRORES_IA[e.message] ??
  (e.message.startsWith('HTTP_')
    ? `El servicio respondió con error (${e.message.slice(5)}). Revisa la clave y vuelve a intentar.`
    : 'No se pudo conectar con el servicio. Revisa tu conexión.');

/* E9 (plantillas) + E12 (sugerencias con IA): se elige o redacta el mensaje
   y recién entonces se abre WhatsApp. */
export default function MensajeModal({ contacto, plantillas, onCerrar, onEnviar, onGuardarPlantilla }) {
  const [plantillaId, setPlantillaId] = useState(plantillas[0]?.id ?? null);
  const [texto, setTexto] = useState(plantillas[0]?.texto ?? '');
  const [sugerencias, setSugerencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [errorIA, setErrorIA] = useState('');
  const aborto = useRef(null);

  // Si se cierra el diálogo con una petición en curso, se cancela
  useEffect(() => () => aborto.current?.abort(), []);

  const plantilla = plantillas.find((p) => p.id === plantillaId);
  const modificada = plantilla && plantilla.texto !== texto;
  const final = reemplazarVariables(texto, contacto);

  const elegirPlantilla = (e) => {
    const id = e.target.value === '' ? null : Number(e.target.value);
    setPlantillaId(id);
    const p = plantillas.find((x) => x.id === id);
    if (p) setTexto(p.texto);
  };

  const sugerir = async () => {
    aborto.current?.abort();
    aborto.current = new AbortController();
    setCargando(true);
    setErrorIA('');
    try {
      setSugerencias(await sugerirMensajes(contacto, { signal: aborto.current.signal }));
    } catch (e) {
      if (e.name !== 'AbortError') { setSugerencias([]); setErrorIA(mensajeDeError(e)); }
    } finally {
      setCargando(false);
    }
  };

  const usarSugerencia = (s) => { setPlantillaId(null); setTexto(s.mensaje); };

  return (
    <Modal titulo={`Mensaje para ${contacto.nombre}`} onCerrar={onCerrar} ancho="max-w-lg">
      <div className="space-y-3">
        <div>
          <label htmlFor="msg-plantilla" className="mb-1 block text-xs font-medium text-slate-600">Plantilla</label>
          <select id="msg-plantilla" className={campo} value={plantillaId ?? ''} onChange={elegirPlantilla}>
            {plantillas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            <option value="">Mensaje libre</option>
          </select>
        </div>

        <div>
          <label htmlFor="msg-texto" className="mb-1 block text-xs font-medium text-slate-600">
            Texto (puedes usar {'{nombre}'}, {'{apellido}'} y {'{grupo}'})
          </label>
          <textarea id="msg-texto" className={campo} rows={3} value={texto}
            onChange={(e) => setTexto(e.target.value)} />
          {modificada && (
            <button type="button" className={`${btnSecundario} mt-2`}
              onClick={() => onGuardarPlantilla(plantilla.id, texto)}>
              Guardar cambios en la plantilla «{plantilla.nombre}»
            </button>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-slate-600">Vista previa</p>
          <p className="mt-1 break-words rounded-lg bg-slate-50 p-2 text-sm">
            {final || <span className="text-slate-500">El mensaje está vacío.</span>}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={sugerir} disabled={cargando} className={btnSecundario}>
              {cargando ? 'Generando propuestas…' : 'Sugerir mensaje'}
            </button>
            <p className="text-xs text-slate-500">
              Se envía a un servicio externo: nombre de pila, grupo y notas. No se envían teléfono ni correo.
            </p>
          </div>

          {errorIA && <p role="alert" className="mt-2 text-xs text-red-600">{errorIA}</p>}

          {sugerencias.length > 0 && (
            <ul className="mt-2 space-y-2">
              {sugerencias.map((s) => (
                <li key={s.tono}>
                  <button type="button" onClick={() => usarSugerencia(s)}
                    className={`w-full rounded-lg border border-slate-200 p-2 text-left text-sm hover:bg-slate-50 ${foco}`}>
                    <span className="block text-xs font-semibold capitalize text-blue-700">{s.tono}</span>
                    {s.mensaje}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onCerrar} className={`${btnSecundario} px-4 py-2 text-sm`}>Cancelar</button>
          <button type="button" disabled={!final.trim()} onClick={() => onEnviar(final)} className={btnPrimario}>
            Abrir WhatsApp
          </button>
        </div>
      </div>
    </Modal>
  );
}
