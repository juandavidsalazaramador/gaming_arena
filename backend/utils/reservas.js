function crearClavesHorario(estacionId, fecha, horaInicio, duracionHoras) {
  const [hora] = horaInicio.split(":").map(Number);
  const inicio = new Date(`${fecha}T${String(hora).padStart(2, "0")}:00:00.000Z`);
  const claves = [];

  for (let indice = 0; indice < duracionHoras; indice += 1) {
    const bloque = new Date(inicio.getTime() + indice * 60 * 60 * 1000);
    const fechaBloque = bloque.toISOString().slice(0, 10);
    const horaBloque = String(bloque.getUTCHours()).padStart(2, "0");
    claves.push(`${estacionId}:${fechaBloque}:${horaBloque}`);
  }

  return claves;
}

function formatearReserva(reserva) {
  const fecha = reserva.fecha.toISOString().slice(0, 10);
  const [horaInicio] = reserva.horaInicio.split(":").map(Number);
  const horaFin = (horaInicio + reserva.duracionHoras) % 24;
  const fechaFin = new Date(
    new Date(`${fecha}T${reserva.horaInicio}:00.000Z`).getTime() +
      reserva.duracionHoras * 60 * 60 * 1000,
  );
  const horaFinTexto = `${String(horaFin).padStart(2, "0")}:00`;

  return {
    id: reserva._id.toString(),
    stationId: reserva.estacionId,
    stationName: reserva.estacionNombre,
    date: fecha,
    dateRaw: fecha,
    time: `${reserva.horaInicio} - ${horaFinTexto}`,
    endDate: fechaFin.toISOString().slice(0, 10),
    durationHours: reserva.duracionHoras,
    totalPrice: reserva.precioTotal,
    status: reserva.estado,
    observations: reserva.observaciones,
    user:
      reserva.usuario && reserva.usuario.nombre
        ? { id: reserva.usuario._id.toString(), name: reserva.usuario.nombre }
        : reserva.usuario
          ? { id: reserva.usuario.toString() }
          : undefined,
    createdAt: reserva.createdAt,
    updatedAt: reserva.updatedAt,
  };
}

module.exports = { crearClavesHorario, formatearReserva };
