/* Reemplaza {nombre}, {apellido} y {grupo}. Una variable desconocida se deja tal cual. */
export function reemplazarVariables(texto, contacto) {
  const valores = {
    nombre: contacto.nombre,
    apellido: contacto.apellido ?? '',
    grupo: contacto.grupo_nombre ?? ''
  };
  return String(texto).replace(/\{(\w+)\}/g, (entero, clave) =>
    Object.hasOwn(valores, clave) ? valores[clave] : entero
  );
}
