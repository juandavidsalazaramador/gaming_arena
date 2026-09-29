const { Router } = require("express");
const { registrar } = require("../controllers/usuario.controlador");
const { validarRegistro } = require("../validators/usuario.validador");
const { validarCampos } = require("../middlewares/validarCampos");

// Rutas de usuarios: /api/usuarios
const router = Router();

// POST /api/usuarios -> Registrar un nuevo usuario (HUS-02)
// Orden: primero valida los campos, luego ejecuta el controlador
router.post("/", validarRegistro, validarCampos, registrar);

module.exports = router;
