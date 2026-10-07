const { Router } = require("express");
const { login } = require("../controllers/auth.controlador");
const { validarLogin } = require("../validators/usuario.validador");
const { validarCampos } = require("../middlewares/validarCampos");

// Rutas de autenticación: /api/auth
const router = Router();

// POST /api/auth/login -> Iniciar sesión (HUS-01)
router.post("/login", validarLogin, validarCampos, login);

module.exports = router;
