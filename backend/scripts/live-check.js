const mongoose = require("mongoose");
const http = require("http");
require("dotenv").config();

const app = require("../app");
const Usuario = require("../models/Usuario");
const Servicio = require("../models/Servicio");

const PORT = 4099; // Puerto de pruebas aislado

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };
    if (dataString) {
      reqHeaders["Content-Type"] = "application/json";
      reqHeaders["Content-Length"] = Buffer.byteLength(dataString);
    }

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: PORT,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let resBody = "";
        res.on("data", (chunk) => (resBody += chunk));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(resBody);
          } catch (e) {
            json = resBody;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      }
    );

    req.on("error", reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FALLÓ: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASÓ: ${message}`);
  }
}

async function runTests() {
  console.log("🚀 Iniciando suite de pruebas de integración...");

  const mongoUri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/gaming_arena_test";
  await mongoose.connect(mongoUri);
  console.log("📦 Conectado a MongoDB para pruebas.");

  // Limpiar colecciones de prueba
  await Usuario.deleteMany({ correo: /@test-arena\.com$/ });
  await Servicio.deleteMany({ nombre: /^TEST_/ });

  const server = app.listen(PORT);

  try {
    // 1. Health check
    const rHealth = await request("GET", "/health");
    assert(rHealth.status === 200, "GET /health responde 200");
    assert(rHealth.body.status === "ok", "GET /health devuelve status ok");

    // 2. Registro público de cliente
    const rRegCliente = await request("POST", "/api/usuarios", {
      nombre: "Jugador Uno",
      correo: "cliente1@test-arena.com",
      contraseña: "password123",
    });
    assert(rRegCliente.status === 201, "POST /api/usuarios (cliente) responde 201");
    assert(rRegCliente.body.usuario.rol === "cliente", "Rol asignado es 'cliente'");
    assert(!rRegCliente.body.usuario.contraseña, "No se expone la contraseña");
    assert(!rRegCliente.body.usuario.__v, "No se expone __v");
    const cliente1Id = rRegCliente.body.usuario._id;

    // 3. Intento de escalada de privilegios en registro público
    const rRegHacker = await request("POST", "/api/usuarios", {
      nombre: "Hacker Falso Admin",
      correo: "hacker@test-arena.com",
      contraseña: "password123",
      rol: "administrador",
    });
    assert(rRegHacker.status === 201, "Registro público con rol admin responde 201");
    assert(
      rRegHacker.body.usuario.rol === "cliente",
      "Seguridad: Rol forzado a 'cliente' para peticiones públicas"
    );

    // 4. Registro duplicado
    const rDup = await request("POST", "/api/usuarios", {
      nombre: "Duplicado",
      correo: "cliente1@test-arena.com",
      contraseña: "password123",
    });
    assert(rDup.status === 409, "Registro duplicado responde 409");

    // 5. Validación de registro fallida
    const rBadReg = await request("POST", "/api/usuarios", {
      nombre: "",
      correo: "correo-invalido",
      contraseña: "123",
    });
    assert(rBadReg.status === 400, "Registro inválido responde 400");
    assert(rBadReg.body.mensaje === "Error de validación", "Formato de error validarCampos");

    // 6. Login de cliente
    const rLoginCliente = await request("POST", "/api/auth/login", {
      correo: "cliente1@test-arena.com",
      contraseña: "password123",
    });
    assert(rLoginCliente.status === 200, "Login de cliente responde 200");
    const tokenCliente = rLoginCliente.body.token;
    assert(tokenCliente, "Login devuelve token JWT");
    assert(rLoginCliente.body.usuario.rol === "cliente", "Token payload incluye rol cliente");

    // 7. Dashboard con token cliente
    const rDash = await request("GET", "/api/dashboard", null, {
      Authorization: `Bearer ${tokenCliente}`,
    });
    assert(rDash.status === 200, "GET /api/dashboard con token responde 200");

    // 8. Dashboard sin token
    const rDashNoAuth = await request("GET", "/api/dashboard");
    assert(rDashNoAuth.status === 401, "GET /api/dashboard sin token responde 401");

    // Sembrar un administrador de prueba directamente
    const adminUser = await Usuario.create({
      nombre: "Admin Principal",
      correo: "admin@test-arena.com",
      contraseña: "adminPassword123",
      rol: "administrador",
    });
    const adminId = adminUser._id.toString();

    // 9. Login de administrador
    const rLoginAdmin = await request("POST", "/api/auth/login", {
      correo: "admin@test-arena.com",
      contraseña: "adminPassword123",
    });
    assert(rLoginAdmin.status === 200, "Login de administrador responde 200");
    const tokenAdmin = rLoginAdmin.body.token;
    assert(rLoginAdmin.body.usuario.rol === "administrador", "Usuario logueado es administrador");

    // 10. Admin crea otro admin con token
    const rAdminCreaAdmin = await request(
      "POST",
      "/api/usuarios",
      {
        nombre: "Admin Auxiliar",
        correo: "admin2@test-arena.com",
        contraseña: "adminPassword123",
        rol: "administrador",
      },
      { Authorization: `Bearer ${tokenAdmin}` }
    );
    assert(rAdminCreaAdmin.status === 201, "Admin crea admin responde 201");
    assert(
      rAdminCreaAdmin.body.usuario.rol === "administrador",
      "Rol administrador respetado al venir de admin autenticado"
    );
    const admin2Id = rAdminCreaAdmin.body.usuario._id;

    // 11. Admin lista usuarios
    const rListUsers = await request("GET", "/api/usuarios", null, {
      Authorization: `Bearer ${tokenAdmin}`,
    });
    assert(rListUsers.status === 200, "GET /api/usuarios (admin) responde 200");
    assert(Array.isArray(rListUsers.body.usuarios), "Respuesta contiene arreglo de usuarios");
    assert(rListUsers.body.total >= 3, "Total de usuarios correcto");

    // 12. Búsqueda y paginación en usuarios
    const rSearchUsers = await request("GET", "/api/usuarios?q=Jugador", null, {
      Authorization: `Bearer ${tokenAdmin}`,
    });
    assert(rSearchUsers.status === 200, "Búsqueda de usuarios responde 200");
    assert(rSearchUsers.body.usuarios.length >= 1, "Encuentra al menos 1 usuario");

    // 13. Cliente intenta listar usuarios -> 403
    const rClientListUsers = await request("GET", "/api/usuarios", null, {
      Authorization: `Bearer ${tokenCliente}`,
    });
    assert(rClientListUsers.status === 403, "Cliente listando usuarios recibe 403");

    // 14. Cliente obtiene su propio usuario por ID -> 200
    const rClientGetSelf = await request(
      "GET",
      `/api/usuarios/${cliente1Id}`,
      null,
      { Authorization: `Bearer ${tokenCliente}` }
    );
    assert(rClientGetSelf.status === 200, "Cliente viendo su propio ID responde 200");

    // 15. Cliente intenta obtener otro usuario por ID -> 403
    const rClientGetOther = await request(
      "GET",
      `/api/usuarios/${adminId}`,
      null,
      { Authorization: `Bearer ${tokenCliente}` }
    );
    assert(rClientGetOther.status === 403, "Cliente viendo ID ajeno recibe 403");

    // 16. Admin obtiene cualquier usuario por ID -> 200
    const rAdminGetClient = await request(
      "GET",
      `/api/usuarios/${cliente1Id}`,
      null,
      { Authorization: `Bearer ${tokenAdmin}` }
    );
    assert(rAdminGetClient.status === 200, "Admin viendo usuario por ID responde 200");

    // 17. Usuario con ID inexistente -> 404
    const rUser404 = await request(
      "GET",
      "/api/usuarios/507f1f77bcf86cd799439011",
      null,
      { Authorization: `Bearer ${tokenAdmin}` }
    );
    assert(rUser404.status === 404, "Usuario inexistente responde 404");

    // 18. Usuario con ID inválido -> 400
    const rUserBadId = await request("GET", "/api/usuarios/id-malo", null, {
      Authorization: `Bearer ${tokenAdmin}`,
    });
    assert(rUserBadId.status === 400, "ID inválido responde 400");

    // 19. Admin intentando eliminarse a sí mismo -> 400
    const rAdminDelSelf = await request(
      "DELETE",
      `/api/usuarios/${adminId}`,
      null,
      { Authorization: `Bearer ${tokenAdmin}` }
    );
    assert(rAdminDelSelf.status === 400, "Admin autoeliminándose responde 400");

    // 20. Cliente intentando eliminar usuario -> 403
    const rClientDelUser = await request(
      "DELETE",
      `/api/usuarios/${admin2Id}`,
      null,
      { Authorization: `Bearer ${tokenCliente}` }
    );
    assert(rClientDelUser.status === 403, "Cliente eliminando usuario recibe 403");

    // 21. Admin eliminando a otro usuario -> 200
    const rAdminDelUser = await request(
      "DELETE",
      `/api/usuarios/${admin2Id}`,
      null,
      { Authorization: `Bearer ${tokenAdmin}` }
    );
    assert(rAdminDelUser.status === 200, "Admin eliminando usuario responde 200");

    // ==========================================
    // PRUEBAS DE SERVICIOS
    // ==========================================

    // 22. Admin crea servicio activo -> 201
    const rCreateServ1 = await request(
      "POST",
      "/api/servicios",
      {
        nombre: "TEST_Torneo League of Legends",
        descripcion: "Torneo 5v5 oficial",
        categoria: "torneo",
        precio: 30000,
        duracionMinutos: 180,
        activo: true,
      },
      { Authorization: `Bearer ${tokenAdmin}` }
    );
    assert(rCreateServ1.status === 201, "Admin crea servicio responde 201");
    const serv1Id = rCreateServ1.body.servicio._id;

    // 23. Admin crea servicio inactivo -> 201
    const rCreateServ2 = await request(
      "POST",
      "/api/servicios",
      {
        nombre: "TEST_Alquiler Cabina VIP Inactiva",
        descripcion: "Mantenimiento preventivo",
        categoria: "alquiler",
        precio: 50000,
        duracionMinutos: 60,
        activo: false,
      },
      { Authorization: `Bearer ${tokenAdmin}` }
    );
    assert(rCreateServ2.status === 201, "Admin crea servicio inactivo responde 201");
    const serv2Id = rCreateServ2.body.servicio._id;

    // 24. Servicio duplicado -> 409
    const rDupServ = await request(
      "POST",
      "/api/servicios",
      {
        nombre: "TEST_Torneo League of Legends",
        categoria: "torneo",
        precio: 20000,
      },
      { Authorization: `Bearer ${tokenAdmin}` }
    );
    assert(rDupServ.status === 409, "Servicio con nombre duplicado responde 409");

    // 25. Cliente intentando crear servicio -> 403
    const rClientCreateServ = await request(
      "POST",
      "/api/servicios",
      {
        nombre: "TEST_Servicio Cliente",
        categoria: "otro",
        precio: 1000,
      },
      { Authorization: `Bearer ${tokenCliente}` }
    );
    assert(rClientCreateServ.status === 403, "Cliente creando servicio recibe 403");

    // 26. Cliente lista servicios -> solo activos
    const rClientListServ = await request("GET", "/api/servicios", null, {
      Authorization: `Bearer ${tokenCliente}`,
    });
    assert(rClientListServ.status === 200, "Cliente listando servicios responde 200");
    const inactivoEncontradoPorCliente = rClientListServ.body.servicios.some(
      (s) => s._id === serv2Id
    );
    assert(
      !inactivoEncontradoPorCliente,
      "Cliente NO puede ver servicios inactivos en el listado"
    );

    // 27. Admin lista servicios -> ve activos e inactivos
    const rAdminListServ = await request("GET", "/api/servicios", null, {
      Authorization: `Bearer ${tokenAdmin}`,
    });
    assert(rAdminListServ.status === 200, "Admin listando servicios responde 200");
    const inactivoEncontradoPorAdmin = rAdminListServ.body.servicios.some(
      (s) => s._id === serv2Id
    );
    assert(
      inactivoEncontradoPorAdmin,
      "Administrador puede ver servicios inactivos en el listado"
    );

    // 28. Cliente obtiene servicio activo por ID -> 200
    const rClientGetActivo = await request(
      "GET",
      `/api/servicios/${serv1Id}`,
      null,
      { Authorization: `Bearer ${tokenCliente}` }
    );
    assert(rClientGetActivo.status === 200, "Cliente viendo servicio activo responde 200");

    // 29. Cliente intenta ver servicio inactivo por ID -> 404
    const rClientGetInactivo = await request(
      "GET",
      `/api/servicios/${serv2Id}`,
      null,
      { Authorization: `Bearer ${tokenCliente}` }
    );
    assert(
      rClientGetInactivo.status === 404,
      "Cliente viendo servicio inactivo recibe 404 (oculto)"
    );

    // 30. Admin obtiene servicio inactivo por ID -> 200
    const rAdminGetInactivo = await request(
      "GET",
      `/api/servicios/${serv2Id}`,
      null,
      { Authorization: `Bearer ${tokenAdmin}` }
    );
    assert(rAdminGetInactivo.status === 200, "Admin viendo servicio inactivo responde 200");

    // 31. Cliente intenta eliminar servicio -> 403
    const rClientDelServ = await request(
      "DELETE",
      `/api/servicios/${serv1Id}`,
      null,
      { Authorization: `Bearer ${tokenCliente}` }
    );
    assert(rClientDelServ.status === 403, "Cliente eliminando servicio recibe 403");

    // 32. Admin elimina servicio -> 200
    const rAdminDelServ = await request(
      "DELETE",
      `/api/servicios/${serv1Id}`,
      null,
      { Authorization: `Bearer ${tokenAdmin}` }
    );
    assert(rAdminDelServ.status === 200, "Admin eliminando servicio responde 200");

    // 33. Admin elimina servicio inexistente -> 404
    const rAdminDelServ404 = await request(
      "DELETE",
      "/api/servicios/507f1f77bcf86cd799439011",
      null,
      { Authorization: `Bearer ${tokenAdmin}` }
    );
    assert(rAdminDelServ404.status === 404, "Eliminar servicio inexistente responde 404");

    console.log("\n=======================================================");
    console.log("🎉 TODAS LAS 33 PRUEBAS DE INTEGRACIÓN PASARON AL 100%");
    console.log("=======================================================\n");
  } finally {
    // Limpieza de datos de prueba y cierre de conexiones
    await Usuario.deleteMany({ correo: /@test-arena\.com$/ });
    await Servicio.deleteMany({ nombre: /^TEST_/ });
    server.close();
    await mongoose.connection.close();
  }
}

runTests().catch((err) => {
  console.error("❌ Error en ejecución de pruebas:", err);
  process.exit(1);
});
