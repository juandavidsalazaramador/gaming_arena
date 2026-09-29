const { Router } = require("express");

const router = Router();

// Montamos las rutas de cada recurso
// Cada archivo define sus propios endpoints
router.use("/usuarios", require("./usuario.routes"));    // POST /api/usuarios
router.use("/auth", require("./auth.routes"));           // POST /api/auth/login
router.use("/dashboard", require("./dashboard.routes")); // GET /api/dashboard

module.exports = router;
