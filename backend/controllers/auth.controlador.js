const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

// ============ HUS-01: LOGIN ============
// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { correo, contraseña } = req.body;

    // 2. Buscar el usuario por correo.
    // select('+contraseña') porque en el modelo la contraseña está oculta por seguridad
    const usuario = await Usuario.findOne({ correo }).select("+contraseña");

    // 4. Rechazar credenciales incorrectas (mismo mensaje si el correo
    //    no existe o la contraseña está mal, para no dar pistas a atacantes)
    if (!usuario) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    // 3. Comparar la contraseña enviada con la encriptada usando bcrypt
    const contraseñaValida = await usuario.compararContraseña(contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    // 5. Generar el JWT con la información del usuario
    // El secreto viene de la variable de entorno JWT_SECRET (.env)
    const token = jwt.sign(
      {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    // 6. Respuesta exitosa SIN la contraseña
    res.json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    next(error);
  }
};
