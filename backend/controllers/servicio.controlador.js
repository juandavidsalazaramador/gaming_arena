const Servicio = require("../models/Servicio");

// ============ CRD SERVICIOS: CREAR SERVICIO ============
// POST /api/servicios
exports.crear = async (req, res, next) => {
  try {
    const { nombre, descripcion, categoria, precio, duracionMinutos, activo } =
      req.body;

    // Verificar si ya existe un servicio con el mismo nombre
    const servicioExiste = await Servicio.findOne({ nombre });
    if (servicioExiste) {
      return res
        .status(409)
        .json({ mensaje: "Ya existe un servicio con ese nombre" });
    }

    const servicio = await Servicio.create({
      nombre,
      descripcion,
      categoria,
      precio,
      duracionMinutos,
      activo,
    });

    const servicioRespuesta = servicio.toObject();
    delete servicioRespuesta.__v;

    res.status(201).json({
      mensaje: "Servicio creado correctamente",
      servicio: servicioRespuesta,
    });
  } catch (error) {
    next(error);
  }
};

// ============ CRD SERVICIOS: LISTAR SERVICIOS ============
// GET /api/servicios
exports.listar = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );
    const skip = (page - 1) * limit;

    const filtro = {};

    // Política de acceso:
    // Los clientes solo ven servicios activos.
    // Los administradores ven todos por defecto, o pueden filtrar por activo explícitamente.
    if (req.user.rol === "cliente") {
      filtro.activo = true;
    } else if (req.query.activo !== undefined) {
      filtro.activo = req.query.activo === "true" || req.query.activo === true;
    }

    // Filtro por categoría
    if (req.query.categoria) {
      filtro.categoria = req.query.categoria;
    }

    // Búsqueda por nombre de servicio (con regex escapado)
    if (req.query.q) {
      const qLimpio = String(req.query.q).trim();
      if (qLimpio) {
        const regexEscapado = qLimpio.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filtro.nombre = { $regex: regexEscapado, $options: "i" };
      }
    }

    const [total, servicios] = await Promise.all([
      Servicio.countDocuments(filtro),
      Servicio.find(filtro)
        .select("-__v")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
    ]);

    const totalPaginas = Math.ceil(total / limit) || 1;

    res.json({
      mensaje: "Servicios obtenidos correctamente",
      servicios,
      total,
      pagina: page,
      totalPaginas,
    });
  } catch (error) {
    next(error);
  }
};

// ============ CRD SERVICIOS: OBTENER SERVICIO POR ID ============
// GET /api/servicios/:id
exports.obtenerPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const servicio = await Servicio.findById(id).select("-__v");
    if (!servicio) {
      return res.status(404).json({ mensaje: "Servicio no encontrado" });
    }

    // Un cliente no puede ver un servicio que no esté activo
    if (req.user.rol === "cliente" && !servicio.activo) {
      return res.status(404).json({ mensaje: "Servicio no encontrado" });
    }

    res.json({
      mensaje: "Servicio obtenido correctamente",
      servicio,
    });
  } catch (error) {
    next(error);
  }
};

// ============ CRD SERVICIOS: ELIMINAR SERVICIO ============
// DELETE /api/servicios/:id
exports.eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;

    const servicioEliminado = await Servicio.findByIdAndDelete(id).select(
      "-__v"
    );
    if (!servicioEliminado) {
      return res.status(404).json({ mensaje: "Servicio no encontrado" });
    }

    res.json({
      mensaje: "Servicio eliminado correctamente",
      servicio: servicioEliminado,
    });
  } catch (error) {
    next(error);
  }
};
