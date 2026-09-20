const PREFIJO_PAIS = '51'; // Perú

/* '+51 965 123 456' -> '51965123456' */
export function normalizarTelefono(telefono) {
  const digitos = String(telefono).replace(/\D/g, '');
  if (digitos.startsWith(PREFIJO_PAIS)) return digitos;
  return PREFIJO_PAIS + digitos.replace(/^0+/, '');
}

/* Enlace listo para abrir el chat con el mensaje escrito */
export function enlaceWhatsApp(telefono, mensaje = '') {
  const numero = normalizarTelefono(telefono);
  const texto = encodeURIComponent(mensaje);
  return `https://wa.me/${numero}${texto ? `?text=${texto}` : ''}`;
}

/* Compartir con el sistema; si no existe, copia al portapapeles.
   Devuelve 'compartido' | 'cancelado' | 'copiado' | 'error' */
export async function compartirContacto(c) {
  const texto =
    `${c.nombre} ${c.apellido}\n` +
    `Teléfono: +${normalizarTelefono(c.telefono)}\n` +
    (c.email ? `Correo: ${c.email}\n` : '');

  if (navigator.share) {
    try {
      await navigator.share({ title: c.nombre, text: texto });
      return 'compartido';
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelado';
    }
  }
  try {
    await navigator.clipboard.writeText(texto);
    return 'copiado';
  } catch {
    return 'error';
  }
}

/* vCard 3.0: las comas, punto y coma y saltos de línea van escapados */
const esc = (t) =>
  String(t ?? '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n')
    .replace(/,/g, '\\,').replace(/;/g, '\\;');

/* Descarga el contacto como archivo .vcf que reconoce cualquier agenda */
export function descargarVCard(c) {
  const vcf = [
    'BEGIN:VCARD', 'VERSION:3.0',
    `N:${esc(c.apellido)};${esc(c.nombre)};;;`,
    `FN:${esc(`${c.nombre} ${c.apellido}`.trim())}`,
    `TEL;TYPE=CELL:+${normalizarTelefono(c.telefono)}`,
    c.email ? `EMAIL:${esc(c.email)}` : null,
    c.cumple ? `BDAY:${c.cumple}` : null,
    c.notas ? `NOTE:${esc(c.notas)}` : null,
    'END:VCARD'
  ].filter(Boolean).join('\r\n'); // CRLF: algunas agendas de Android ignoran \n

  const url = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${c.nombre}-${c.apellido}`.replace(/\s+/g, '_').replace(/-$/, '') + '.vcf';
  a.click();
  URL.revokeObjectURL(url);
}
