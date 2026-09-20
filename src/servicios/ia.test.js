import test from 'node:test';
import assert from 'node:assert/strict';
import { parsearSugerencias } from './ia.js';

const TRES = '[{"tono":"formal","mensaje":"Estimada Ana."},{"tono":"cercano","mensaje":"Hola Ana!"},{"tono":"breve","mensaje":"Hola Ana"}]';

test('acepta un arreglo JSON limpio', () => {
  assert.equal(parsearSugerencias(TRES).length, 3);
});

test('tolera bloques de código alrededor del JSON', () => {
  assert.equal(parsearSugerencias('```json\n' + TRES + '\n```').length, 3);
});

test('texto que no es JSON lanza FORMATO', () => {
  assert.throws(() => parsearSugerencias('Claro, aquí tienes tres ideas...'), /FORMATO/);
});

test('JSON con otra forma lanza FORMATO', () => {
  assert.throws(() => parsearSugerencias('{"tono":"formal"}'), /FORMATO/);
  assert.throws(() => parsearSugerencias('[]'), /FORMATO/);
});
