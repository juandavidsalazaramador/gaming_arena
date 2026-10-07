const { Router } = require("express");
const {
  crear,
  listar,
  obtenerPorId,
  eliminar,
} = require("../controllers/servicio.controlador");
const {
  validarCrearServicio,
  validarIdServicio,
  validarListadoServicios,
} = require("../validators/servicio.validador");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { validarCampos } = require("../middlewares/validarCampos");

const router = Router();

// POST /api/servicios -> Crear nuevo servicio (solo administrador)
router.post(
  "/",
  requireAuth,
  requireRole("administrador"),
  validarCrearServicio,
  validarCampos,
  crear
);

// GET /api/servicios -> Listar servicios con paginación y filtros (autenticado)
router.get("/", requireAuth, validarListadoServicios, validarCampos, listar);

// GET /api/servicios/:id -> Obtener servicio por ID (autenticado)
router.get("/:id", requireAuth, validarIdServicio, validarCampos, obtenerPorId);

// DELETE /api/servicios/:id -> Eliminar servicio por ID (solo administrador)
router.delete(
  "/:id",
  requireAuth,
  requireRole("administrador"),
  validarIdServicio,
  validarCampos,
  eliminar
);

module.exports = router;
