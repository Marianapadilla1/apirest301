require('dotenv').config();

const createApp = require('./app');
const pool = require('./db');

const port = Number(process.env.PORT || 3000);
const app = createApp(pool);

async function startServer() {
  await pool.query('SELECT 1');
  const server = app.listen(port, () => {
    console.log(`API escuchando en http://localhost:${port}`);
  });

  const shutdown = () => {
    server.close(async (error) => {
      if (error) {
        console.error('Error al cerrar el servidor:', error);
        process.exitCode = 1;
      }

      try {
        await pool.end();
      } catch (closeError) {
        console.error('Error al cerrar el pool de MySQL:', closeError);
        process.exitCode = 1;
      }
    });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

startServer().catch(async (error) => {
  console.error('No se pudo iniciar la API o conectar con MySQL:', error);
  try {
    await pool.end();
  } catch (closeError) {
    console.error('Error al cerrar el pool de MySQL:', closeError);
  }
  process.exitCode = 1;
});