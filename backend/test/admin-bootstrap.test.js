const assert = require("node:assert/strict");
const test = require("node:test");

const Usuario = require("../models/Usuario");
const { ensureAdminAccount } = require("../config/admin");

function setAdminCredentials(t) {
  const originalEmail = process.env.ADMIN_EMAIL;
  const originalPassword = process.env.ADMIN_PASSWORD;
  process.env.ADMIN_EMAIL = "bootstrap@example.com";
  process.env.ADMIN_PASSWORD = "bootstrapPassword123";
  t.after(() => {
    if (originalEmail === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = originalEmail;
    if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = originalPassword;
  });
}

test("crea la cuenta administradora si no existe", async (t) => {
  setAdminCredentials(t);
  t.mock.method(Usuario, "findOne", () => ({
    select: async () => null,
  }));
  const create = t.mock.method(Usuario, "create", async () => {});

  await ensureAdminAccount();

  assert.deepEqual(create.mock.calls[0].arguments[0], {
    nombre: "Admin Principal",
    correo: "bootstrap@example.com",
    contraseña: "bootstrapPassword123",
    rol: "administrador",
  });
});

test("actualiza a administrador una cuenta existente con credenciales distintas", async (t) => {
  setAdminCredentials(t);
  const usuario = {
    rol: "cliente",
    compararContraseña: async () => false,
    save: async () => {},
  };
  const save = t.mock.method(usuario, "save");
  t.mock.method(Usuario, "findOne", () => ({
    select: async () => usuario,
  }));

  await ensureAdminAccount();

  assert.equal(usuario.nombre, "Admin Principal");
  assert.equal(usuario.contraseña, "bootstrapPassword123");
  assert.equal(usuario.rol, "administrador");
  assert.equal(save.mock.callCount(), 1);
});

test("no modifica una cuenta administradora ya inicializada", async (t) => {
  setAdminCredentials(t);
  const usuario = {
    rol: "administrador",
    compararContraseña: async () => true,
    save: async () => {},
  };
  const save = t.mock.method(usuario, "save");
  t.mock.method(Usuario, "findOne", () => ({
    select: async () => usuario,
  }));

  await ensureAdminAccount();

  assert.equal(save.mock.callCount(), 0);
});
