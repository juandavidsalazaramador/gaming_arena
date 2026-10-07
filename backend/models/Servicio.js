const mongoose = require("mongoose");

// ============ MODELO SERVICIO ============
// Representa los servicios ofrecidos en Gaming Arena (torneos, alquiler de consolas/PCs, coaching, etc.)
const servicioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del servicio es obligatorio"],
      unique: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
      default: "",
    },
    categoria: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      enum: {
        values: ["torneo", "alquiler", "coaching", "otro"],
        message: "La categoría debe ser torneo, alquiler, coaching u otro",
      },
      default: "otro",
    },
    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },
    duracionMinutos: {
      type: Number,
      min: [1, "La duración debe ser mayor a 0 minutos"],
      default: 60,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Servicio", servicioSchema);
