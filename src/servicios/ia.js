/* E12: redacción asistida por un modelo de lenguaje.
   ATENCIÓN: la clave de API en el navegador es solo para el laboratorio.
   En un producto real la llamada pasa por tu propio servidor. */

const MODELO = import.meta.env?.VITE_MODELO_IA || 'claude-sonnet-5';

/* Este es el prompt de sistema que se entrega en el informe */
export const PROMPT_SISTEMA = `Eres un asistente que redacta mensajes cortos de WhatsApp en español de Perú.
Recibirás un objeto JSON con el nombre de pila del destinatario, el grupo al que pertenece y unas notas opcionales.
Escribe exactamente tres propuestas de mensaje, cada una con un tono distinto: "formal", "cercano" y "breve".
Reglas: usa el nombre del destinatario, no inventes datos que no estén en las notas, máximo 280 caracteres por mensaje y sin emojis.
Responde ÚNICAMENTE con un arreglo JSON de tres objetos con esta forma, sin texto antes ni después y sin bloques de código:
[{"tono":"formal","mensaje":"..."},{"tono":"cercano","mensaje":"..."},{"tono":"breve","mensaje":"..."}]`;

/* Valida la respuesta del modelo. Un modelo puede devolver texto imprevisto,
   así que el parseo va protegido y lanza un error entendible. */
export function parsearSugerencias(texto) {
  const limpio = String(texto).replace(/```(?:json)?/gi, '').trim();
  let datos;
  try {
    datos = JSON.parse(limpio);
  } catch {
    throw new Error('FORMATO');
  }
  const validas = Array.isArray(datos)
    ? datos.filter((d) => d && typeof d.tono === 'string' && typeof d.mensaje === 'string' && d.mensaje.trim())
    : [];
  if (validas.length === 0) throw new Error('FORMATO');
  return validas.slice(0, 3).map((d) => ({ tono: d.tono, mensaje: d.mensaje.trim() }));
}

/* Solo sale lo mínimo: nombre de pila, grupo y notas. Nunca teléfono ni correo. */
export async function sugerirMensajes(contacto, { signal } = {}) {
  const clave = import.meta.env?.VITE_ANTHROPIC_API_KEY;
  if (!clave) throw new Error('SIN_CLAVE');

  const datos = {
    nombre: contacto.nombre,
    grupo: contacto.grupo_nombre ?? '',
    notas: contacto.notas ?? ''
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: {
      'content-type': 'application/json',
      'x-api-key': clave,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: 600,
      system: PROMPT_SISTEMA,
      messages: [{ role: 'user', content: JSON.stringify(datos) }]
    })
  });
  if (!res.ok) throw new Error(`HTTP_${res.status}`);

  const cuerpo = await res.json();
  const texto = (cuerpo.content ?? [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
  return parsearSugerencias(texto);
}
