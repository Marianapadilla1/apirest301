module.exports = function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.status === 400 && error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la solicitud contiene JSON inválido.' });
  }

  if (error.statusCode && error.statusCode < 500) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  console.error('Error al procesar la solicitud:', error);
  return res.status(500).json({ error: 'Ocurrió un error interno.' });
};