const { Router } = require("express");
const {
  crear,
  listar,
  obtenerPorId,
  actualizar,
  cancelar,
} = require("../controllers/reserva.controlador");
const {
  validarDatosReserva,
  validarIdReserva,
  validarListadoReservas,
} = require("../validators/reserva.validador");
const { requireAuth } = require("../middlewares/auth");
const { validarCampos } = require("../middlewares/validarCampos");

const router = Router();

router.use(requireAuth);

router.post("/", validarDatosReserva, validarCampos, crear);
router.get("/", validarListadoReservas, validarCampos, listar);
router.get("/:id", validarIdReserva, validarCampos, obtenerPorId);
router.put("/:id", validarIdReserva, validarDatosReserva, validarCampos, actualizar);
router.patch("/:id/cancel", validarIdReserva, validarCampos, cancelar);

module.exports = router;
