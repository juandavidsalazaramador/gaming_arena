const Usuario = require("../models/Usuario");

// ============ HUS-02: REGISTRAR USUARIO ============
// POST /api/usuarios
exports.registrar = async (req, res, next) => {
  try {
    const { nombre, correo, contraseña, rol } = req.body;

    // Verificar que el correo no esté registrado anteriormente
    const correoExiste = await Usuario.findOne({ correo });
    if (correoExiste) {
      return res.status(409).json({ mensaje: "El correo ya está registrado" });
    }

    // Prevención de escalada de privilegios:
    // Solo un administrador autenticado puede asignar el rol "administrador".
    // En cualquier otro caso (petición pública o cliente), se fuerza el rol "cliente".
    let rolAsignado = "cliente";
    if (req.user && req.user.rol === "administrador" && rol) {
      rolAsignado = rol;
    }

    // Crear el usuario. La contraseña se encripta automáticamente
    // gracias al "pre save" del modelo (bcryptjs)
    const usuario = await Usuario.create({
      nombre,
      correo,
      contraseña,
      rol: rolAsignado,
    });

    // Nunca devolvemos la contraseña ni __v en la respuesta
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

// ============ CRD USUARIOS: LISTAR USUARIOS ============
// GET /api/usuarios
exports.listar = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filtro = {};

    // Filtro por rol si se envía
    if (req.query.rol) {
      filtro.rol = req.query.rol;
    }

    // Búsqueda por nombre o correo con caracteres regex escapados
    if (req.query.q) {
      const qLimpio = String(req.query.q).trim();
      if (qLimpio) {
        const regexEscapado = qLimpio.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filtro.$or = [
          { nombre: { $regex: regexEscapado, $options: "i" } },
          { correo: { $regex: regexEscapado, $options: "i" } },
        ];
      }
    }

    const [total, usuarios] = await Promise.all([
      Usuario.countDocuments(filtro),
      Usuario.find(filtro)
        .select("-contraseña -__v")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
    ]);

    const totalPaginas = Math.ceil(total / limit) || 1;

    res.json({
      mensaje: "Usuarios obtenidos correctamente",
      usuarios,
      total,
      pagina: page,
      totalPaginas,
    });
  } catch (error) {
    next(error);
  }
};

// ============ CRD USUARIOS: OBTENER USUARIO POR ID ============
// GET /api/usuarios/:id
exports.obtenerPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Solo un administrador o el propio usuario pueden consultar el perfil
    if (req.user.rol !== "administrador" && req.user.id !== id) {
      return res
        .status(403)
        .json({ ok: false, message: "Prohibido: rol insuficiente" });
    }

    const usuario = await Usuario.findById(id).select("-contraseña -__v");
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({
      mensaje: "Usuario obtenido correctamente",
      usuario,
    });
  } catch (error) {
    next(error);
  }
};

// ============ CRD USUARIOS: ELIMINAR USUARIO ============
// DELETE /api/usuarios/:id
exports.eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Un administrador no puede eliminarse a sí mismo
    if (req.user.id === id) {
      return res.status(400).json({
        mensaje: "Un administrador no puede eliminarse a sí mismo",
      });
    }

    const usuarioEliminado = await Usuario.findByIdAndDelete(id).select(
      "-contraseña -__v"
    );

    if (!usuarioEliminado) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({
      mensaje: "Usuario eliminado correctamente",
      usuario: usuarioEliminado,
    });
  } catch (error) {
    next(error);
  }
};
