const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const test = require("node:test");

const Usuario = require("../models/Usuario");
const { registrar } = require("../controllers/usuario.controlador");
const { authOpcional, requireRole } = require("../middlewares/auth");

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

async function registrarUsuario(t, user, requestedRole) {
  const create = t.mock.method(Usuario, "create", async (data) => ({
    toObject: () => ({ ...data, _id: "user-id", __v: 0 }),
  }));
  t.mock.method(Usuario, "findOne", async () => null);

  const req = {
    user,
    body: {
      nombre: "Jugador",
      correo: "player@example.com",
      contraseña: "secret123",
      rol: requestedRole,
    },
  };
  const res = createResponse();
  await registrar(req, res, (error) => {
    throw error;
  });

  return { create, res };
}

test("authOpcional permite registro público sin asignar identidad", () => {
  const req = { headers: {} };
  const res = createResponse();
  let continued = false;

  authOpcional(req, res, () => {
    continued = true;
  });

  assert.equal(continued, true);
  assert.equal(req.user, undefined);
});

test("authOpcional valida el token y conserva el campo rol", (t) => {
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "test-secret";
  t.after(() => {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  });

  const req = {
    headers: {
      authorization: `Bearer ${jwt.sign({ rol: "administrador" }, process.env.JWT_SECRET)}`,
    },
  };
  const res = createResponse();
  let continued = false;

  authOpcional(req, res, () => {
    continued = true;
  });

  assert.equal(continued, true);
  assert.equal(req.user.rol, "administrador");
});

test("requireRole autoriza el rol incluido en el JWT", () => {
  const req = { user: { rol: "administrador" } };
  const res = createResponse();
  let continued = false;

  requireRole("administrador")(req, res, () => {
    continued = true;
  });

  assert.equal(continued, true);
});

test("el registro público fuerza el rol cliente aunque se solicite administrador", async (t) => {
  const { create, res } = await registrarUsuario(t, undefined, "administrador");

  assert.equal(res.statusCode, 201);
  assert.equal(create.mock.calls[0].arguments[0].rol, "cliente");
});

test("un administrador autenticado puede asignar el rol solicitado", async (t) => {
  const { create, res } = await registrarUsuario(
    t,
    { rol: "administrador" },
    "administrador",
  );

  assert.equal(res.statusCode, 201);
  assert.equal(create.mock.calls[0].arguments[0].rol, "administrador");
});
