const { Router } = require("express");

const router = Router();

// Montamos las rutas de cada recurso
// Cada archivo define sus propios endpoints
router.use("/usuarios", require("./usuario.routes"));    // CRD /api/usuarios
router.use("/auth", require("./auth.routes"));           // POST /api/auth/login
router.use("/dashboard", require("./dashboard.routes")); // GET /api/dashboard
router.use("/servicios", require("./servicio.routes")); // CRD /api/servicios

module.exports = router;
