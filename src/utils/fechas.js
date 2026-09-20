/* '2007-03-15' -> '15/03/2007'. Se corta el texto en vez de usar Date
   para evitar el desfase de zona horaria. */
export function formatearFecha(iso) {
  if (!iso) return '';
  const [a, m, d] = String(iso).slice(0, 10).split('-');
  return a && m && d ? `${d}/${m}/${a}` : '';
}

/* '2026-09-18 16:51:03' -> '18/09/2026 16:51' */
export function formatearFechaHora(iso) {
  if (!iso) return '';
  return `${formatearFecha(iso)} ${String(iso).slice(11, 16)}`.trim();
}
