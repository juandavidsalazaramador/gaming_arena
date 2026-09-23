const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ============ MODELO USUARIO ============
// Representa a un usuario de Gaming Arena (cliente o administrador)
const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    correo: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true, // no pueden existir dos usuarios con el mismo correo
      lowercase: true, // guarda el correo siempre en minúsculas
      trim: true,
    },
    contraseña: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false, // por defecto NO se trae la contraseña en las consultas (seguridad)
    },
    rol: {
      type: String,
      enum: {
        values: ["cliente", "administrador"],
        message: "El rol debe ser cliente o administrador",
      },
      default: "cliente",
    },
  },
  { timestamps: true }, // agrega fechaCreacion / fechaActualizacion automáticamente
);

// ============ ENCRIPTACIÓN DE CONTRASEÑA ============
// Antes de guardar el usuario en la base de datos, se encripta la contraseña
// con bcryptjs (nunca se guarda como texto plano)
usuarioSchema.pre("save", async function (next) {
  // Si la contraseña no cambió, no la volvemos a encriptar
  if (!this.isModified("contraseña")) return next();

  // Genera un hash con 10 rondas de encriptación
  this.contraseña = await bcrypt.hash(this.contraseña, 10);
  next();
});

// ============ MÉTODO PARA COMPARAR CONTRASEÑAS ============
// Se usa en el login: compara la contraseña que envía el usuario
// con la contraseña encriptada guardada en la base de datos
usuarioSchema.methods.compararContraseña = function (contraseñaEnviada) {
  return bcrypt.compare(contraseñaEnviada, this.contraseña);
};

module.exports = mongoose.model("Usuario", usuarioSchema);
