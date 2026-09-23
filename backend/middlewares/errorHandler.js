// 404 - Ruta no encontrada
function notFound(req, res, next) {
  res
    .status(404)
    .json({
      ok: false,
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    });
}

// Manejador central de errores
function errorHandler(err, req, res, next) {
  console.error("❌ Error:", err.stack || err.message);

  // Error de validación de Mongoose
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res
      .status(400)
      .json({ ok: false, message: "Error de validación", errors: messages });
  }

  // ObjectId inválido
  if (err.name === "CastError") {
    return res
      .status(400)
      .json({ ok: false, message: `ID inválido: ${err.value}` });
  }

  // Duplicado (clave única repetida)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(", ");
    return res
      .status(409)
      .json({ ok: false, message: `Valor duplicado en: ${field}` });
  }

  // JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ ok: false, message: "Token inválido" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ ok: false, message: "Token expirado" });
  }

  res.status(err.status || 500).json({
    ok: false,
    message: err.message || "Error interno del servidor",
  });
}

module.exports = { notFound, errorHandler };
