const { body } = require("express-validator");

// ============ VALIDACIONES DEL REGISTRO (HUS-02) ============
// Se ejecutan antes de llegar al controlador. Cada regla puede tener
// un mensaje personalizado que se muestra al usuario.
const validarRegistro = [
  body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),

  body("correo")
    .trim()
    .notEmpty()
    .withMessage("El correo es obligatorio")
    .isEmail()
    .withMessage("El correo no es válido")
    .normalizeEmail(), // convierte a minúsculas y limpia el correo

  body("contraseña")
    .trim()
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),

  body("rol")
    .optional() // si no se envía, el modelo asigna "cliente" por defecto
    .isIn(["cliente", "administrador"])
    .withMessage("El rol debe ser cliente o administrador"),
];

// ============ VALIDACIONES DEL LOGIN (HUS-01) ============
const validarLogin = [
  body("correo")
    .trim()
    .notEmpty()
    .withMessage("El correo es obligatorio")
    .isEmail()
    .withMessage("El correo no es válido"),

  body("contraseña")
    .trim()
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),
];

module.exports = { validarRegistro, validarLogin };
