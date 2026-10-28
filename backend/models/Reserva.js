const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },
    estacionId: {
      type: String,
      required: true,
      trim: true,
    },
    estacionNombre: {
      type: String,
      required: true,
      trim: true,
    },
    fecha: {
      type: Date,
      required: true,
    },
    horaInicio: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):00$/,
    },
    duracionHoras: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    precioPorHora: {
      type: Number,
      required: true,
      min: 0,
    },
    precioTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    observaciones: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    estado: {
      type: String,
      enum: ["confirmada", "finalizada", "cancelada"],
      default: "confirmada",
    },
    clavesHorario: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true },
);

reservaSchema.index(
  { clavesHorario: 1 },
  { unique: true, partialFilterExpression: { estado: "confirmada" } },
);
reservaSchema.index({ usuario: 1, fecha: -1 });

module.exports = mongoose.model("Reserva", reservaSchema);
