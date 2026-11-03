const express = require('express');
const asyncHandler = require('../middleware/async-handler');
const { parseProductId, validateProduct } = require('../product-validation');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const [products] = await req.db.query(
    'SELECT pk_clave_pro, nombre, descripcion, precio, stock, activo, fk_clave_cat FROM tb_productos ORDER BY pk_clave_pro',
  );
  res.json(products);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseProductId(req.params.id);
  const [products] = await req.db.query(
    'SELECT pk_clave_pro, nombre, descripcion, precio, stock, activo, fk_clave_cat FROM tb_productos WHERE pk_clave_pro = ?',
    [id],
  );

  if (products.length === 0) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  return res.json(products[0]);
}));

router.post('/', asyncHandler(async (req, res) => {
  const product = validateProduct(req.body);
  const [result] = await req.db.query(
    `INSERT INTO tb_productos
      (nombre, descripcion, precio, stock, activo, fk_clave_cat)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      product.nombre,
      product.descripcion,
      product.precio,
      product.stock,
      product.activo,
      product.fk_clave_cat,
    ],
  );
  const [products] = await req.db.query(
    'SELECT pk_clave_pro, nombre, descripcion, precio, stock, activo, fk_clave_cat FROM tb_productos WHERE pk_clave_pro = ?',
    [result.insertId],
  );

  return res.status(201).json(products[0]);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const id = parseProductId(req.params.id);
  const product = validateProduct(req.body);
  const [result] = await req.db.query(
    `UPDATE tb_productos
     SET nombre = ?, descripcion = ?, precio = ?, stock = ?, activo = ?, fk_clave_cat = ?
     WHERE pk_clave_pro = ?`,
    [
      product.nombre,
      product.descripcion,
      product.precio,
      product.stock,
      product.activo,
      product.fk_clave_cat,
      id,
    ],
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  const [products] = await req.db.query(
    'SELECT pk_clave_pro, nombre, descripcion, precio, stock, activo, fk_clave_cat FROM tb_productos WHERE pk_clave_pro = ?',
    [id],
  );
  return res.json(products[0]);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const id = parseProductId(req.params.id);
  const product = validateProduct(req.body, { partial: true });
  const fields = Object.keys(product);
  const assignments = fields.map((field) => `${field} = ?`).join(', ');
  const [result] = await req.db.query(
    `UPDATE tb_productos SET ${assignments} WHERE pk_clave_pro = ?`,
    [...fields.map((field) => product[field]), id],
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  const [products] = await req.db.query(
    'SELECT pk_clave_pro, nombre, descripcion, precio, stock, activo, fk_clave_cat FROM tb_productos WHERE pk_clave_pro = ?',
    [id],
  );
  return res.json(products[0]);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = parseProductId(req.params.id);
  const [result] = await req.db.query(
    'DELETE FROM tb_productos WHERE pk_clave_pro = ?',
    [id],
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  return res.status(204).end();
}));

module.exports = router;