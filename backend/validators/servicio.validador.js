const { body, param, query } = require("express-validator");

// ============ VALIDACIONES PARA CREAR SERVICIO ============
const validarCrearServicio = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre del servicio es obligatorio"),

  body("descripcion")
    .optional()
    .isString()
    .withMessage("La descripción debe ser un texto"),

  body("categoria")
    .trim()
    .notEmpty()
    .withMessage("La categoría es obligatoria")
    .isIn(["torneo", "alquiler", "coaching", "otro"])
    .withMessage("La categoría debe ser torneo, alquiler, coaching u otro"),

  body("precio")
    .notEmpty()
    .withMessage("El precio es obligatorio")
    .isFloat({ min: 0 })
    .withMessage("El precio debe ser un número mayor o igual a 0"),

  body("duracionMinutos")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La duración debe ser un número entero mayor a 0 minutos"),

  body("activo")
    .optional()
    .isBoolean()
    .withMessage("El campo activo debe ser un valor booleano"),
];

// ============ VALIDACIÓN DE ID DE SERVICIO EN PARÁMETROS ============
const validarIdServicio = [
  param("id")
    .isMongoId()
    .withMessage("El ID de servicio no es válido"),
];

// ============ VALIDACIONES DE LISTADO CON PAGINACIÓN Y FILTROS ============
const validarListadoServicios = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La página debe ser un número entero mayor a 0"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("El límite debe ser un número entero entre 1 y 100"),

  query("categoria")
    .optional()
    .isIn(["torneo", "alquiler", "coaching", "otro"])
    .withMessage("La categoría debe ser torneo, alquiler, coaching u otro"),

  query("activo")
    .optional()
    .isBoolean()
    .withMessage("El campo activo debe ser true o false"),

  query("q")
    .optional()
    .isString()
    .withMessage("El parámetro de búsqueda debe ser una cadena de texto"),
];

module.exports = {
  validarCrearServicio,
  validarIdServicio,
  validarListadoServicios,
};
