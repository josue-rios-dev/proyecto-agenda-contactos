import { useRef, useState } from 'react';
import DialogoConfirmar from './DialogoConfirmar.jsx';
import { exportarArchivo, reemplazarDB } from '../db/database.js';
import { btnSecundario, tarjeta } from '../ui.js';

/* E7: exporta el archivo agenda.db real e importa otro reemplazando el actual */
export default function Respaldo({ onImportado }) {
  const entrada = useRef(null);
  const [pendiente, setPendiente] = useState(null); // { nombre, bytes }
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);

  const avisar = (texto, error = false) => { setMensaje(texto); setEsError(error); };

  const exportar = () => {
    const blob = new Blob([exportarArchivo()], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agenda.db';
    a.click();
    URL.revokeObjectURL(url);
    avisar('Se descargó agenda.db.');
  };

  const elegirArchivo = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo
    if (!archivo) return;
    setPendiente({ nombre: archivo.name, bytes: new Uint8Array(await archivo.arrayBuffer()) });
  };

  const confirmar = () => {
    try {
      reemplazarDB(pendiente.bytes);
      onImportado();
      avisar(`Se importó ${pendiente.nombre}.`);
    } catch (err) {
      avisar(err.message, true);
    }
    setPendiente(null);
  };

  return (
    <section className={`${tarjeta} space-y-3`} aria-labelledby="titulo-respaldo">
      <h2 id="titulo-respaldo" className="text-base font-semibold">Copia de seguridad</h2>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={exportar} className={btnSecundario}>Exportar agenda.db</button>
        <button type="button" onClick={() => entrada.current.click()} className={btnSecundario}>Importar…</button>
        <input ref={entrada} type="file" accept=".db,.sqlite,application/octet-stream"
          className="hidden" onChange={elegirArchivo} aria-label="Elegir archivo de base de datos" tabIndex={-1} />
      </div>
      {mensaje && (
        <p role={esError ? 'alert' : 'status'} className={`text-xs ${esError ? 'text-red-600' : 'text-slate-500'}`}>
          {mensaje}
        </p>
      )}

      {pendiente && (
        <DialogoConfirmar
          titulo="Importar base de datos"
          mensaje={`Se reemplazará toda la agenda actual por el contenido de «${pendiente.nombre}». Esta acción no se puede deshacer.`}
          textoAceptar="Reemplazar agenda"
          onAceptar={confirmar}
          onCancelar={() => setPendiente(null)}
        />
      )}
    </section>
  );
}
