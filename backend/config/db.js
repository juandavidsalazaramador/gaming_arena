const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI no está definida en el archivo .env");
  }

  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(uri);
  console.log(
    `✅ MongoDB conectado: ${conn.connection.host}/${conn.connection.name}`,
  );
  return conn;
}

async function disconnectDB() {
  await mongoose.connection.close();
  console.log("MongoDB desconectado");
}

module.exports = { connectDB, disconnectDB };
