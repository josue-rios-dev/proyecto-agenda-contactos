/* E11: detector de duplicados.
   similitud = 1 - distancia / longitud del texto más largo, umbral 0.85.
   - Una letra de diferencia se marca si el texto tiene 7 o más caracteres
     (1/7 -> 0.857) y no si tiene 6 (1/6 -> 0.833).
   - Dos letras de diferencia se marcan desde 14 caracteres (2/14 -> 0.857;
     con 13 da 0.846).
   Ejemplos: "carlos perez" / "carlos peres" = 0.92 sí se marca;
   "ana rios" / "ana ruiz" = 0.63 no; "juan perez" / "jose perez" = 0.70 no.
   Bajar el umbral a 0.70 ya marcaría a Juan y José Pérez como la misma
   persona; subirlo a 0.95 dejaría pasar errores de tipeo evidentes. */
export const UMBRAL = 0.85;

/* minúsculas, sin tildes y con espacios simples */
export const normalizar = (t) =>
  String(t ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/* Cantidad mínima de inserciones, borrados y sustituciones para pasar de a a b */
export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let previa = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const actual = [i];
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      actual[j] = Math.min(previa[j] + 1, actual[j - 1] + 1, previa[j - 1] + costo);
    }
    previa = actual;
  }
  return previa[b.length];
}

/* 1 = idénticos tras normalizar, 0 = totalmente distintos */
export function similitud(a, b) {
  const x = normalizar(a);
  const y = normalizar(b);
  const mayor = Math.max(x.length, y.length);
  if (mayor === 0) return 1;
  return 1 - levenshtein(x, y) / mayor;
}

/* Los 9 últimos dígitos ignoran el prefijo: '+51 965 123 456' = '965123456' */
export const ultimosDigitos = (tel) => String(tel).replace(/\D/g, '').slice(-9);

/* Contactos existentes que se parecen al que se va a crear */
export function buscarSimilares(nuevo, existentes, umbral = UMBRAL) {
  const nombreNuevo = `${nuevo.nombre} ${nuevo.apellido ?? ''}`;
  const telNuevo = ultimosDigitos(nuevo.telefono);
  const halladas = [];

  for (const c of existentes) {
    if (telNuevo.length >= 6 && telNuevo === ultimosDigitos(c.telefono)) {
      halladas.push({ contacto: c, puntaje: 1, motivo: 'Mismo teléfono (distinto formato o prefijo)' });
      continue;
    }
    const puntaje = similitud(nombreNuevo, `${c.nombre} ${c.apellido}`);
    if (puntaje >= umbral) {
      halladas.push({ contacto: c, puntaje, motivo: `Nombre muy parecido (${Math.round(puntaje * 100)} %)` });
    }
  }
  return halladas.sort((p, q) => q.puntaje - p.puntaje);
}
