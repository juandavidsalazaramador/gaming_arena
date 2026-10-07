const Usuario = require("../models/Usuario");

// ============ HUS-02: REGISTRAR USUARIO ============
// POST /api/usuarios
exports.registrar = async (req, res, next) => {
  try {
    const { nombre, correo, contraseña, rol } = req.body;

    // 7. Verificar que el correo no esté registrado anteriormente
    const correoExiste = await Usuario.findOne({ correo });
    if (correoExiste) {
      return res.status(409).json({ mensaje: "El correo ya está registrado" });
    }

    // Crear el usuario. La contraseña se encripta automáticamente
    // gracias al "pre save" del modelo (bcryptjs)
    const usuario = await Usuario.create({ nombre, correo, contraseña, rol });

    // Nunca devolvemos la contraseña en la respuesta
    const usuarioRespuesta = usuario.toObject();
    delete usuarioRespuesta.contraseña;
    delete usuarioRespuesta.__v;

    // 201 Created: el usuario se registró correctamente
    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: usuarioRespuesta,
    });
  } catch (error) {
    // 500 Internal Server Error (lo maneja el errorHandler central)
    next(error);
  }
};
