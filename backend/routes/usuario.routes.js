const { Router } = require("express");
const {
  registrar,
  listar,
  obtenerPorId,
  eliminar,
} = require("../controllers/usuario.controlador");
const {
  validarRegistro,
  validarId,
  validarListado,
} = require("../validators/usuario.validador");
const { requireAuth, requireRole, authOpcional } = require("../middlewares/auth");
const { validarCampos } = require("../middlewares/validarCampos");

// Rutas de usuarios: /api/usuarios
const router = Router();

// POST /api/usuarios -> Registrar un nuevo usuario (HUS-02)
// authOpcional permite registrar admin solo si quien llama es admin autenticado
router.post("/", authOpcional, validarRegistro, validarCampos, registrar);

// GET /api/usuarios -> Listar usuarios con paginación y búsqueda (solo administrador)
router.get(
  "/",
  requireAuth,
  requireRole("administrador"),
  validarListado,
  validarCampos,
  listar
);

// GET /api/usuarios/:id -> Obtener usuario por ID (administrador o el propio usuario)
router.get("/:id", requireAuth, validarId, validarCampos, obtenerPorId);

// DELETE /api/usuarios/:id -> Eliminar usuario por ID (solo administrador)
router.delete(
  "/:id",
  requireAuth,
  requireRole("administrador"),
  validarId,
  validarCampos,
  eliminar
);

module.exports = router;
