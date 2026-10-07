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
    req.user = decoded; // { id, nombre, correo, rol }
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ ok: false, message: "Token inválido o expirado" });
  }
}

// Middleware opcional: si se envía token lo valida y adjunta a req.user,
// pero no bloquea la petición si no se envía o si no es válido.
function authOpcional(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (err) {
    // Si el token es inválido o expiró se ignora y se continúa sin usuario autenticado
    req.user = null;
  }
  next();
}

// Restringe acceso por rol(es). Uso: requireAuth, requireRole("administrador")
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "No autorizado" });
    }
    if (roles.length && !roles.includes(req.user.rol)) {
      return res
        .status(403)
        .json({ ok: false, message: "Prohibido: rol insuficiente" });
    }
    next();
  };
}

module.exports = { requireAuth, authOpcional, requireRole };
