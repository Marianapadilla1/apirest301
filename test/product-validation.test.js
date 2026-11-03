const test = require('node:test');
const assert = require('node:assert/strict');
const { parseProductId, validateProduct } = require('../src/product-validation');

test('valida los datos obligatorios y completa los valores por defecto', () => {
  assert.deepEqual(validateProduct({ nombre: ' Café ', precio: '12.50' }), {
    nombre: 'Café',
    descripcion: null,
    precio: 12.5,
    stock: 0,
    activo: 1,
    fk_clave_cat: null,
  });
});

test('rechaza datos inválidos y campos desconocidos', () => {
  assert.throws(() => validateProduct({ nombre: '', precio: 1 }), { statusCode: 400 });
  assert.throws(() => validateProduct({ nombre: 'Café', precio: 1.999 }), { statusCode: 400 });
  assert.throws(() => validateProduct({ nombre: 'Café', precio: 1, extra: true }), { statusCode: 400 });
  assert.throws(() => validateProduct({ nombre: 'Café', precio: 1, stock: -1 }), { statusCode: 400 });
});

test('valida identificadores de productos', () => {
  assert.equal(parseProductId('12'), 12);
  assert.throws(() => parseProductId('0'), { statusCode: 400 });
  assert.throws(() => parseProductId('1abc'), { statusCode: 400 });
});