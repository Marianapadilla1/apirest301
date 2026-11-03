const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const createApp = require('../src/app');

function createFakeDb() {
  const products = new Map();
  let nextId = 1;

  return {
    products,
    async query(sql, values = []) {
      if (sql.startsWith('INSERT INTO')) {
        const [nombre, descripcion, precio, stock, activo, fk_clave_cat] = values;
        const product = { pk_clave_pro: nextId++, nombre, descripcion, precio, stock, activo, fk_clave_cat };
        products.set(product.pk_clave_pro, product);
        return [{ insertId: product.pk_clave_pro }];
      }

      if (sql.startsWith('SELECT') && sql.includes('WHERE pk_clave_pro = ?')) {
        return [[products.get(values[0])].filter(Boolean)];
      }

      if (sql.startsWith('SELECT')) {
        return [[...products.values()]];
      }

      if (sql.startsWith('UPDATE')) {
        const id = values[values.length - 1];
        const product = products.get(id);
        if (!product) return [{ affectedRows: 0 }];

        const fields = [...sql.matchAll(/([a-z_]+) = \?/g)].map((match) => match[1]);
        fields.forEach((field, index) => {
          product[field] = values[index];
        });
        return [{ affectedRows: 1 }];
      }

      if (sql.startsWith('DELETE')) {
        return [{ affectedRows: Number(products.delete(values[0])) }];
      }

      throw new Error(`Consulta no esperada en prueba: ${sql}`);
    },
  };
}

async function withServer(run) {
  const db = createFakeDb();
  const server = createApp(db).listen(0);
  await once(server, 'listening');
  const baseUrl = `http://127.0.0.1:${server.address().port}/api/productos`;

  try {
    await run(baseUrl, db);
  } finally {
    server.close();
    await once(server, 'close');
  }
}

test('permite crear, consultar, actualizar y eliminar productos', async () => {
  await withServer(async (url) => {
    const createdResponse = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nombre: 'Café', precio: 35.5, stock: 4 }),
    });
    assert.equal(createdResponse.status, 201);
    const created = await createdResponse.json();
    assert.equal(created.pk_clave_pro, 1);
    assert.equal(created.activo, 1);

    const readResponse = await fetch(`${url}/1`);
    assert.equal(readResponse.status, 200);
    assert.equal((await readResponse.json()).nombre, 'Café');

    const updatedResponse = await fetch(`${url}/1`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ stock: 8 }),
    });
    assert.equal(updatedResponse.status, 200);
    assert.equal((await updatedResponse.json()).stock, 8);

    const deletedResponse = await fetch(`${url}/1`, { method: 'DELETE' });
    assert.equal(deletedResponse.status, 204);
    assert.equal((await fetch(`${url}/1`)).status, 404);
  });
});

test('rechaza solicitudes inválidas con una respuesta 400', async () => {
  await withServer(async (url) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nombre: '', precio: -3 }),
    });
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /nombre/);
  });
});