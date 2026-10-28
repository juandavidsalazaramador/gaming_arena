const Reserva = require("../models/Reserva");
const estaciones = require("../config/estaciones");
const { crearClavesHorario, formatearReserva } = require("../utils/reservas");

function obtenerHoraInicio(time) {
  return time.split(" - ")[0];
}

function fechaHoraBogota(fecha, hora) {
  return new Date(`${fecha}T${hora}:00-05:00`);
}

function fechaUTC(fecha) {
  return new Date(`${fecha}T00:00:00.000Z`);
}

function esConflictoDuplicado(error) {
  return error.code === 11000;
}

async function verificarDisponibilidad(clavesHorario, idExcluir) {
  const filtro = { clavesHorario: { $in: clavesHorario }, estado: { $ne: "cancelada" } };
  if (idExcluir) filtro._id = { $ne: idExcluir };
  return Reserva.findOne(filtro).select("_id");
}

function responderConflicto(res, next, error) {
  if (esConflictoDuplicado(error)) {
    return res.status(409).json({
      mensaje: "La estación ya está reservada en ese horario",
    });
  }
  return next(error);
}

exports.crear = async (req, res, next) => {
  try {
    const { stationId, date, time, durationHours, observations = "" } = req.body;
    const estacion = estaciones[stationId];
    const horaInicio = obtenerHoraInicio(time);
    if (fechaHoraBogota(date, horaInicio) <= new Date()) {
      return res.status(400).json({
        mensaje: "Selecciona una fecha y hora futuras",
      });
    }

    const clavesHorario = crearClavesHorario(
      stationId,
      date,
      horaInicio,
      durationHours,
    );
    const ocupada = await verificarDisponibilidad(clavesHorario);
    if (ocupada) {
      return res.status(409).json({
        mensaje: "La estación ya está reservada en ese horario",
      });
    }

    const reserva = await Reserva.create({
      usuario: req.user.id,
      estacionId: stationId,
      estacionNombre: estacion.nombre,
      fecha: fechaUTC(date),
      horaInicio,
      duracionHoras: durationHours,
      precioPorHora: estacion.precioPorHora,
      precioTotal: estacion.precioPorHora * durationHours,
      observaciones,
      clavesHorario,
    });

    return res.status(201).json({
      mensaje: "Reserva creada correctamente",
      reserva: formatearReserva(reserva),
    });
  } catch (error) {
    return responderConflicto(res, next, error);
  }
};

exports.listar = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const filtro = { usuario: req.user.id };

    if (req.query.status) filtro.estado = req.query.status;
    if (req.query.dateFrom || req.query.dateTo) {
      filtro.fecha = {};
      if (req.query.dateFrom) filtro.fecha.$gte = fechaUTC(req.query.dateFrom);
      if (req.query.dateTo) filtro.fecha.$lte = fechaUTC(req.query.dateTo);
    }
    if (req.query.q) {
      const termino = String(req.query.q).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (termino) filtro.estacionNombre = { $regex: termino, $options: "i" };
    }

    const [total, reservasActivas, reservas] = await Promise.all([
      Reserva.countDocuments(filtro),
      Reserva.countDocuments({ usuario: req.user.id, estado: "confirmada" }),
      Reserva.find(filtro)
        .select("-__v -clavesHorario")
        .populate("usuario", "nombre correo")
        .sort({ fecha: -1, horaInicio: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    return res.json({
      mensaje: "Reservas obtenidas correctamente",
      reservas: reservas.map(formatearReserva),
      total,
      reservasActivas,
      pagina: page,
      totalPaginas: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    return next(error);
  }
};

exports.obtenerPorId = async (req, res, next) => {
  try {
    const reserva = await Reserva.findOne({
      _id: req.params.id,
      usuario: req.user.id,
    })
      .select("-__v -clavesHorario")
      .populate("usuario", "nombre correo");

    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }
    return res.json({
      mensaje: "Reserva obtenida correctamente",
      reserva: formatearReserva(reserva),
    });
  } catch (error) {
    return next(error);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    const reserva = await Reserva.findOne({
      _id: req.params.id,
      usuario: req.user.id,
    });
    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }
    if (reserva.estado !== "confirmada") {
      return res.status(409).json({
        mensaje: "Solo se pueden modificar reservas confirmadas",
      });
    }
    const estacion = estaciones[req.body.stationId];
    const horaInicio = obtenerHoraInicio(req.body.time);
    if (fechaHoraBogota(req.body.date, horaInicio) <= new Date()) {
      return res.status(400).json({
        mensaje: "Selecciona una fecha y hora futuras",
      });
    }
    const clavesHorario = crearClavesHorario(
      req.body.stationId,
      req.body.date,
      horaInicio,
      req.body.durationHours,
    );
    const ocupada = await verificarDisponibilidad(clavesHorario, reserva._id);
    if (ocupada) {
      return res.status(409).json({
        mensaje: "La estación ya está reservada en ese horario",
      });
    }

    reserva.estacionId = req.body.stationId;
    reserva.estacionNombre = estacion.nombre;
    reserva.fecha = fechaUTC(req.body.date);
    reserva.horaInicio = horaInicio;
    reserva.duracionHoras = req.body.durationHours;
    reserva.precioPorHora = estacion.precioPorHora;
    reserva.precioTotal = estacion.precioPorHora * req.body.durationHours;
    reserva.observaciones = req.body.observations || "";
    reserva.clavesHorario = clavesHorario;
    await reserva.save();

    return res.json({
      mensaje: "Reserva actualizada correctamente",
      reserva: formatearReserva(reserva),
    });
  } catch (error) {
    return responderConflicto(res, next, error);
  }
};

exports.cancelar = async (req, res, next) => {
  try {
    const reserva = await Reserva.findOne({
      _id: req.params.id,
      usuario: req.user.id,
    });
    if (!reserva) {
      return res.status(404).json({ mensaje: "Reserva no encontrada" });
    }
    if (reserva.estado === "cancelada") {
      return res.status(409).json({ mensaje: "La reserva ya está cancelada" });
    }
    if (reserva.estado !== "confirmada") {
      return res.status(409).json({
        mensaje: "Solo se pueden cancelar reservas confirmadas",
      });
    }

    reserva.estado = "cancelada";
    await reserva.save();

    return res.json({
      mensaje: "Reserva cancelada correctamente",
      reserva: formatearReserva(reserva),
    });
  } catch (error) {
    return next(error);
  }
};
