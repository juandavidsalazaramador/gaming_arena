const jwt = require("jsonwebtoken");

// Verifica que exista un token JWT válido
function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res
        .status(401)
        .json({ ok: false, message: "No autorizado: falta el token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, ... }
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ ok: false, message: "Token inválido o expirado" });
  }
}

// Restringe acceso por rol(es). Uso: requireAuth, requireRole('admin')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "No autorizado" });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ ok: false, message: "Prohibido: rol insuficiente" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
