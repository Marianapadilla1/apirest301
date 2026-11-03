const express = require('express');
const productosRouter = require('./routes/productos');
const errorHandler = require('./middleware/error-handler');

function createApp(db) {
  const app = express();
  app.use(express.json({ limit: '100kb' }));
  app.use((req, res, next) => {
    req.db = db;
    next();
  });

  app.get('/api', (req, res) => {
    res.json({ mensaje: 'API de productos disponible.', productos: '/api/productos' });
  });
  app.use('/productos', productosRouter);
  app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada.' });
  });
  app.use(errorHandler);

  return app;
}

module.exports = createApp;