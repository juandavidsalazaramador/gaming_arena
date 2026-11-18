const Usuario = require("../models/Usuario");

async function ensureAdminAccount() {
  const correo = process.env.ADMIN_EMAIL || "admin@test-arena.com";
  const contraseña = process.env.ADMIN_PASSWORD || "adminPassword123";
  const usuario = await Usuario.findOne({ correo }).select("+contraseña");

  if (!usuario) {
    await Usuario.create({
      nombre: "Admin Principal",
      correo,
      contraseña,
      rol: "administrador",
    });
    console.log(`✅ Cuenta administradora inicializada: ${correo}`);
    return;
  }

  const contraseñaValida = await usuario.compararContraseña(contraseña);
  if (usuario.rol === "administrador" && contraseñaValida) return;

  usuario.nombre = "Admin Principal";
  usuario.contraseña = contraseña;
  usuario.rol = "administrador";
  await usuario.save();
  console.log(`✅ Cuenta administradora inicializada: ${correo}`);
}

module.exports = { ensureAdminAccount };
