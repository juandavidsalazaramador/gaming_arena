const { Router } = require("express");
const { registrar } = require("../controllers/usuario.controlador");
const { validarRegistro } = require("../validators/usuario.validador");
const { validarCampos } = require("../middlewares/validarCampos");
const { authOpcional } = require("../middlewares/auth");

// Rutas de usuarios: /api/usuarios
const router = Router();

// POST /api/usuarios -> Registrar un nuevo usuario (HUS-02)
// Solo un administrador autenticado puede asignar roles distintos a cliente.
router.post("/", authOpcional, validarRegistro, validarCampos, registrar);

module.exports = router;
