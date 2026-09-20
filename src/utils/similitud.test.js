import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizar, levenshtein, similitud, buscarSimilares, UMBRAL } from './similitud.js';

test('normalizar quita tildes, mayúsculas y espacios sobrantes', () => {
  assert.equal(normalizar('  Ana   RÍOS '), 'ana rios');
});

test('levenshtein: casos conocidos', () => {
  assert.equal(levenshtein('kitten', 'sitting'), 3);
  assert.equal(levenshtein('', 'abc'), 3);
  assert.equal(levenshtein('igual', 'igual'), 0);
});

test('"Ana Ríos" y "Ana Rios" son el mismo nombre', () => {
  assert.equal(similitud('Ana Ríos', 'Ana Rios'), 1);
});

test('una letra de diferencia supera el umbral', () => {
  assert.ok(similitud('Carlos Perez', 'Carlos Peres') >= UMBRAL);
});

test('nombres distintos no superan el umbral', () => {
  assert.ok(similitud('Ana Rios', 'Ana Ruiz') < UMBRAL);
  assert.ok(similitud('Juan Perez', 'Jose Perez') < UMBRAL);
});

test('buscarSimilares detecta teléfonos que solo cambian en el prefijo', () => {
  const existentes = [{ id: 1, nombre: 'Marco', apellido: 'Lazo', telefono: '+51 965 123 456' }];
  const nuevo = { nombre: 'Otro', apellido: 'Nombre', telefono: '965123456' };
  const res = buscarSimilares(nuevo, existentes);
  assert.equal(res.length, 1);
  assert.equal(res[0].puntaje, 1);
});

test('buscarSimilares detecta nombres con tilde distinta', () => {
  const existentes = [{ id: 1, nombre: 'Ana', apellido: 'Ríos', telefono: '911111111' }];
  const res = buscarSimilares({ nombre: 'Ana', apellido: 'Rios', telefono: '922222222' }, existentes);
  assert.equal(res.length, 1);
});

test('buscarSimilares no marca contactos distintos', () => {
  const existentes = [{ id: 1, nombre: 'Luis', apellido: 'Torres', telefono: '911111111' }];
  const res = buscarSimilares({ nombre: 'Rosa', apellido: 'Vega', telefono: '922222222' }, existentes);
  assert.equal(res.length, 0);
});

test('frontera del umbral: 1 letra de diferencia se marca desde 7 caracteres, no con 6', () => {
  assert.ok(similitud('abcdefg', 'abcdefh') >= UMBRAL); // 1/7 -> 0.857
  assert.ok(similitud('abcdef', 'abcdeg') < UMBRAL);    // 1/6 -> 0.833
});

test('frontera del umbral: 2 letras de diferencia se marcan desde 14 caracteres, no con 13', () => {
  assert.ok(similitud('a'.repeat(14), 'a'.repeat(12) + 'bb') >= UMBRAL); // 2/14 -> 0.857
  assert.ok(similitud('a'.repeat(13), 'a'.repeat(11) + 'bb') < UMBRAL);  // 2/13 -> 0.846
});
