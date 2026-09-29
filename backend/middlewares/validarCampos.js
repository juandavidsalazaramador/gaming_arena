const { validationResult } = require("express-validator");

// ============ MIDDLEWARE DE VALIDACIÓN ============
// Revisa el resultado de las validaciones de express-validator.
// Si hay errores, responde con un JSON claro y detiene la petición.
// Si no hay errores, deja continuar hacia el controlador.
// Formato de respuesta:
// {
//   "mensaje": "Error de validación",
//   "errores": [ { "campo": "correo", "mensaje": "El correo no es válido" } ]
// }
function validarCampos(req, res, next) {
  const resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    const errores = resultado.array().map((error) => ({
      campo: error.path,
      mensaje: error.msg,
    }));

    return res.status(400).json({ mensaje: "Error de validación", errores });
  }

  next();
}

module.exports = { validarCampos };
