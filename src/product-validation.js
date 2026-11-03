const productFields = [
  'nombre',
  'descripcion',
  'precio',
  'stock',
  'activo',
  'fk_clave_cat',
];

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function parseInteger(value, field, { nullable = false } = {}) {
  if (nullable && value === null) {
    return null;
  }

  if (!Number.isSafeInteger(value) || value < 0 || (!nullable && value === 0)) {
    throw validationError(`${field} debe ser un entero ${nullable ? 'mayor o igual a 0 o null' : 'mayor a 0'}.`);
  }

  return value;
}

function parsePrice(value) {
  if (
    (typeof value !== 'number' && typeof value !== 'string')
    || !/^\d{1,8}(?:\.\d{1,2})?$/.test(String(value))
  ) {
    throw validationError('precio debe ser un número entre 0 y 99999999.99 con máximo 2 decimales.');
  }

  const price = Number(value);
  if (!Number.isFinite(price)) {
    throw validationError('precio debe ser un número válido.');
  }

  return price;
}

function validateProduct(payload, { partial = false } = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw validationError('El cuerpo debe ser un objeto JSON.');
  }

  const keys = Object.keys(payload);
  const unknownFields = keys.filter((field) => !productFields.includes(field));
  if (unknownFields.length > 0) {
    throw validationError(`Campo(s) no permitido(s): ${unknownFields.join(', ')}.`);
  }

  if (partial && keys.length === 0) {
    throw validationError('Debe enviar al menos un campo para actualizar.');
  }

  if (!partial && (!Object.hasOwn(payload, 'nombre') || !Object.hasOwn(payload, 'precio'))) {
    throw validationError('nombre y precio son obligatorios.');
  }

  const product = {};
  if (Object.hasOwn(payload, 'nombre')) {
    if (typeof payload.nombre !== 'string' || payload.nombre.trim().length === 0 || payload.nombre.length > 100) {
      throw validationError('nombre debe ser texto de 1 a 100 caracteres.');
    }
    product.nombre = payload.nombre.trim();
  }

  if (Object.hasOwn(payload, 'descripcion')) {
    if (payload.descripcion !== null && typeof payload.descripcion !== 'string') {
      throw validationError('descripcion debe ser texto o null.');
    }
    product.descripcion = payload.descripcion;
  }

  if (Object.hasOwn(payload, 'precio')) {
    product.precio = parsePrice(payload.precio);
  }

  if (Object.hasOwn(payload, 'stock')) {
    product.stock = parseInteger(payload.stock, 'stock', { nullable: true });
  }

  if (Object.hasOwn(payload, 'activo')) {
    if (![true, false, 0, 1].includes(payload.activo)) {
      throw validationError('activo debe ser true, false, 0 o 1.');
    }
    product.activo = Number(payload.activo);
  }

  if (Object.hasOwn(payload, 'fk_clave_cat')) {
    product.fk_clave_cat = parseInteger(payload.fk_clave_cat, 'fk_clave_cat', { nullable: true });
  }

  if (!partial) {
    return {
      nombre: product.nombre,
      descripcion: product.descripcion ?? null,
      precio: product.precio,
      stock: product.stock ?? 0,
      activo: product.activo ?? 1,
      fk_clave_cat: product.fk_clave_cat ?? null,
    };
  }

  return product;
}

function parseProductId(value) {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
    throw validationError('La clave del producto debe ser un entero positivo.');
  }

  return Number(value);
}

module.exports = { parseProductId, validateProduct };