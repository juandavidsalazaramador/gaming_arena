const assert = require("node:assert/strict");
const test = require("node:test");
const { validationResult } = require("express-validator");

const estaciones = require("../config/estaciones");
const { validarDatosReserva, validarListadoReservas } = require("../validators/reserva.validador");
const { crearClavesHorario, formatearReserva } = require("../utils/reservas");

test("el catálogo backend conserva IDs, nombres y precios del dashboard", () => {
  assert.deepEqual(estaciones, {
    "pc-01": { nombre: "PC Master Race #01 (VIP)", precioPorHora: 12000 },
    "pc-02": { nombre: "PC Master Race #02", precioPorHora: 10000 },
    "console-01": { nombre: "PlayStation 5 Lounge 4K", precioPorHora: 9000 },
    "console-02": { nombre: "Xbox Series X Arena", precioPorHora: 9000 },
    "sim-01": { nombre: "Cockpit Sim Racing Pro", precioPorHora: 16000 },
    "vr-01": { nombre: "Cabina Inmersiva VR 360°", precioPorHora: 15000 },
  });
});

test("el contrato de reserva acepta los valores del formulario del dashboard", async () => {
  const req = {
    body: {
      stationId: "pc-01",
      date: "2026-10-30",
      time: "18:00 - 19:00",
      durationHours: "2",
    },
    params: {},
    query: {},
  };
  await Promise.all(validarDatosReserva.map((validator) => validator.run(req)));

  assert.deepEqual(validationResult(req).array(), []);
  assert.equal(req.body.durationHours, 2);
});

test("el filtro de fecha permite dateFrom sin exigir dateTo", async () => {
  const req = {
    body: {},
    params: {},
    query: { dateFrom: "2026-10-30" },
  };
  await Promise.all(validarListadoReservas.map((validator) => validator.run(req)));

  assert.deepEqual(validationResult(req).array(), []);
});

test("los bloques horarios identifican solapamientos entre reservas", () => {
  const primera = crearClavesHorario("pc-01", "2026-10-30", "18:00", 2);
  const segunda = crearClavesHorario("pc-01", "2026-10-30", "19:00", 1);
  const otraEstacion = crearClavesHorario("pc-02", "2026-10-30", "18:00", 2);

  assert.deepEqual(primera, [
    "pc-01:2026-10-30:18",
    "pc-01:2026-10-30:19",
  ]);
  assert.equal(primera.some((bloque) => segunda.includes(bloque)), true);
  assert.equal(primera.some((bloque) => otraEstacion.includes(bloque)), false);
});

test("los bloques horarios cruzan correctamente la medianoche", () => {
  assert.deepEqual(
    crearClavesHorario("sim-01", "2026-10-30", "22:00", 4),
    [
      "sim-01:2026-10-30:22",
      "sim-01:2026-10-30:23",
      "sim-01:2026-10-31:00",
      "sim-01:2026-10-31:01",
    ],
  );
});

test("la respuesta de reserva conserva las propiedades que consume el dashboard", () => {
  const response = formatearReserva({
    _id: "507f1f77bcf86cd799439011",
    estacionId: "pc-01",
    estacionNombre: "PC Master Race #01 (VIP)",
    fecha: new Date("2026-10-30T00:00:00.000Z"),
    horaInicio: "18:00",
    duracionHoras: 2,
    precioTotal: 24000,
    estado: "confirmada",
    usuario: "507f191e810c19729de860ea",
  });

  assert.deepEqual(
    Object.keys(response).slice(0, 9),
    [
      "id",
      "stationId",
      "stationName",
      "date",
      "dateRaw",
      "time",
      "endDate",
      "durationHours",
      "totalPrice",
    ],
  );
  assert.equal(response.time, "18:00 - 20:00");
  assert.equal(response.status, "confirmada");
});
