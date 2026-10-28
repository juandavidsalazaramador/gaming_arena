const { body, param, query } = require("express-validator");

const estaciones = require("../config/estaciones");

const validarFecha = (valor) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00.000Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
};

const validarDatosReserva = [
  body("stationId")
    .isString()
    .withMessage("La estación es obligatoria")
    .bail()
    .custom((id) => Object.prototype.hasOwnProperty.call(estaciones, id))
    .withMessage("La estación seleccionada no existe"),
  body("date")
    .isString()
    .withMessage("La fecha es obligatoria")
    .bail()
    .custom(validarFecha)
    .withMessage("La fecha debe tener el formato YYYY-MM-DD y ser válida"),
  body("time")
    .isString()
    .withMessage("La hora es obligatoria")
    .bail()
    .matches(/^(14|16|18|20|22):00 - (15|17|19|21|23):00$/)
    .withMessage("La hora seleccionada no está disponible"),
  body("durationHours")
    .isInt({ min: 1, max: 4 })
    .withMessage("La duración debe ser de 1 a 4 horas")
    .toInt(),
  body("observations")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Las observaciones deben ser texto")
    .trim()
    .isLength({ max: 500 })
    .withMessage("Las observaciones no pueden superar 500 caracteres"),
];

const validarIdReserva = [
  param("id").isMongoId().withMessage("El ID de la reserva no es válido"),
];

const validarListadoReservas = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La página debe ser un número entero mayor a 0"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("El límite debe ser un número entero entre 1 y 100"),
  query("status")
    .optional()
    .isIn(["confirmada", "finalizada", "cancelada"])
    .withMessage("El estado de reserva no es válido"),
  query("dateFrom")
    .optional()
    .custom(validarFecha)
    .withMessage("dateFrom debe tener el formato YYYY-MM-DD"),
  query("dateTo")
    .optional()
    .custom(validarFecha)
    .withMessage("dateTo debe tener el formato YYYY-MM-DD"),
  query("dateFrom")
    .custom((dateFrom, { req }) => !dateFrom || !req.query.dateTo || req.query.dateTo >= dateFrom)
    .withMessage("dateTo debe ser igual o posterior a dateFrom"),
  query("q")
    .optional()
    .isString()
    .withMessage("La búsqueda debe ser texto")
    .isLength({ max: 100 })
    .withMessage("La búsqueda no puede superar 100 caracteres"),
];

module.exports = {
  validarDatosReserva,
  validarIdReserva,
  validarListadoReservas,
};
