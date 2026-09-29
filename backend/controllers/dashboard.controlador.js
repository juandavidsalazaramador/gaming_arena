// ============ HUS-03: DASHBOARD ============
// GET /api/dashboard
// Llega aquí solo si el middleware de autenticación verificó el JWT.
// El middleware guarda los datos del usuario en req.user.
exports.inicio = (req, res) => {
  res.json({
    mensaje: "Bienvenido a Gaming Arena",
    usuario: {
      nombre: req.user.nombre,
      correo: req.user.correo,
      rol: req.user.rol,
    },
  });
};
