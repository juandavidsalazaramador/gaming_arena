require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 4000;

async function main() {
  try {
    await connectDB();

    const servidor = app.listen(PORT, () => {
      console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
    });

    // Mensaje claro si el puerto ya está ocupado
    // (ej: cuando otro servidor sigue corriendo en el mismo puerto)
    servidor.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ El puerto ${PORT} ya está en uso.`);
        console.error(`   Cierra la otra ventana del servidor o cambia el puerto en el archivo .env`);
        process.exit(1);
      }
      throw err;
    });
  } catch (err) {
    console.error('❌ Error al iniciar el servidor:', err.message);
    process.exit(1);
  }
}

main();
