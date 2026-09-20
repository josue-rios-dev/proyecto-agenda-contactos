import { useEffect, useRef, useId } from 'react';

const ENFOCABLES = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/* Base de todos los diálogos: role="dialog", Escape para cerrar y el foco
   queda atrapado dentro mientras está abierto (accesible solo con teclado). */
export default function Modal({ titulo, onCerrar, children, ancho = 'max-w-md' }) {
  const caja = useRef(null);
  const cerrar = useRef(onCerrar);
  const idTitulo = useId();
  cerrar.current = onCerrar;

  useEffect(() => {
    const previo = document.activeElement;
    const lista = () => [...caja.current.querySelectorAll(ENFOCABLES)].filter((el) => !el.disabled);

    (caja.current.querySelector('[data-autofocus]') ?? lista()[0] ?? caja.current).focus();

    const alTeclear = (e) => {
      if (e.key === 'Escape') { cerrar.current(); return; }
      if (e.key !== 'Tab') return;
      const items = lista();
      if (items.length === 0) return;
      const primero = items[0];
      const ultimo = items[items.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    };

    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('keydown', alTeclear);
      previo?.focus?.(); // devuelve el foco a lo que lo tenía antes
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div
        ref={caja}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className={`max-h-[90vh] w-full ${ancho} overflow-y-auto rounded-xl bg-white p-5 shadow-xl focus:outline-none`}
      >
        <h2 id={idTitulo} className="mb-3 text-base font-semibold">{titulo}</h2>
        {children}
      </div>
    </div>
  );
}
