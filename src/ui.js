/* Clases de Tailwind compartidas para no repetirlas en cada componente */
export const foco =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1';

export const campo =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500';

export const btnPrimario =
  'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 ' + foco;

export const btnSecundario =
  'rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ' +
  'hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ' + foco;

export const btnPeligro =
  'rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 ' +
  'hover:bg-red-50 ' + foco;

export const btnPeligroSolido =
  'rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 ' + foco;

export const tarjeta = 'rounded-xl bg-white p-4 shadow-sm';
