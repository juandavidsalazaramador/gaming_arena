const { Router } = require("express");
const { inicio } = require("../controllers/dashboard.controlador");
const { requireAuth } = require("../middlewares/auth");

// Rutas del dashboard: /api/dashboard
const router = Router();

// GET /api/dashboard -> Solo con JWT válido (HUS-03)
// requireAuth es el middleware de autenticación
router.get("/", requireAuth, inicio);

module.exports = router;
