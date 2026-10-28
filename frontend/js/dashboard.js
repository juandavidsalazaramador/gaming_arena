/* ========================================================
   GAMING ARENA - LÓGICA DEL DASHBOARD (HUS-03)
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Asegurar sesión activa
  initDashboard();
});

let currentStations = [];
let currentReservations = [];
let editingReservationId = null; // HUS-08: guarda el id de la reserva que se está editando
let reservationPage = 1;
let reservationTotalPages = 1;
let activeReservationsCount = 0;

async function initDashboard() {
  const user = AuthManager.getCurrentUser();
  if (!AuthManager.isAuthenticated() || !user) {
    AuthManager.clearSession();
    window.location.href = 'login.html';
    return;
  }

  currentStations = INITIAL_STATIONS;
  currentReservations = [];

  renderUserHeader(user);
  renderStats(user);
  renderStations('all');
  renderReservations();
  setupFilterTabs();
  setupBookingModal();
  setupReservationFilters();
  setupLogout();
  await loadReservations();
}

// 1. Cabecera y perfil de usuario
function renderUserHeader(user) {
  const nameEl = document.getElementById('user-display-name');
  const tagEl = document.getElementById('user-display-tag');
  const tierEl = document.getElementById('user-display-tier');
  const coinsEl = document.getElementById('user-display-coins');
  const avatarEl = document.getElementById('user-display-avatar');

  if (nameEl) nameEl.textContent = user.fullName || user.gamerTag;
  if (tagEl) tagEl.textContent = `@${user.gamerTag}`;
  if (tierEl) tierEl.textContent = user.tier || 'Rango Oro';
  if (coinsEl) coinsEl.textContent = user.coins == null ? '— Coins' : `${user.coins} Coins`;
  if (avatarEl) avatarEl.textContent = (user.gamerTag || 'G').charAt(0).toUpperCase();

  const heroWelcome = document.getElementById('hero-welcome-text');
  if (heroWelcome) {
    heroWelcome.textContent = `¡Listo para jugar, ${user.gamerTag}! ⚡`;
  }
}

// 2. Métricas rápidas
function renderStats(user) {
  const activeResEl = document.getElementById('stat-active-reservations');
  const totalCoinsEl = document.getElementById('stat-total-coins');
  const hoursPlayedEl = document.getElementById('stat-hours-played');
  const nextSessionEl = document.getElementById('stat-next-session');

  if (activeResEl) activeResEl.textContent = activeReservationsCount;
  if (totalCoinsEl) totalCoinsEl.textContent = user.coins == null ? '—' : `${user.coins} 🪙`;
  if (hoursPlayedEl) hoursPlayedEl.textContent = '—';
  
  if (nextSessionEl) {
    const next = currentReservations.find(r => r.status === 'confirmada');
    nextSessionEl.textContent = next ? `${next.stationName.split(' ')[0]} - ${next.time.split(' - ')[0]}` : 'Ninguna activa';
  }
}

// 3. Catálogo de Estaciones
function renderStations(category = 'all') {
  const container = document.getElementById('stations-container');
  if (!container) return;

  const filtered = category === 'all' 
    ? currentStations 
    : currentStations.filter(s => s.category === category);

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
        <p>No se encontraron estaciones en esta categoría.</p>
      </div>
    `;
    tr.cells[5].textContent = userName;
    return;
  }

  filtered.forEach(station => {
    const isAvailable = station.status === 'disponible';
    const statusBadge = isAvailable
      ? '<span class="badge badge-green">● Disponible</span>'
      : '<span class="badge badge-amber">● Ocupado</span>';

    const card = document.createElement('div');
    card.className = 'station-card';
    card.innerHTML = `
      <div class="station-image-wrapper">
        <img src="${station.image}" alt="${station.name}" class="station-img-banner" loading="lazy">
        <div class="station-status-pill">${statusBadge}</div>
        <div class="station-type-tag">${station.category.toUpperCase()}</div>
      </div>
      <div class="station-body">
        <h3 class="station-title">${station.name}</h3>
        <div class="station-specs">
          ${station.specs.map(spec => `
            <div class="spec-item">
              <span style="color: var(--neon-cyan); font-size: 0.75rem;">⚡</span>
              <span>${spec}</span>
            </div>
          `).join('')}
        </div>
        <div class="station-footer">
          <div class="station-price">
            <span class="price-amount">$${station.pricePerHour.toLocaleString('es-CO')}</span>
            <span class="price-unit">por hora de juego</span>
          </div>
          <button class="btn btn-primary btn-sm btn-book" data-id="${station.id}">
            Reservar 🎮
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  // Vincular eventos a los botones de reserva
  container.querySelectorAll('.btn-book').forEach(btn => {
    btn.addEventListener('click', () => {
      const stationId = btn.getAttribute('data-id');
      openBookingModal(stationId);
    });
  });
}

// 4. Filtros por categorías
function setupFilterTabs() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-category');
      renderStations(cat);
    });
  });
}

// 5. Tabla de Reservas del Jugador
function renderReservations() {
  const tableBody = document.getElementById('reservations-tbody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  if (currentReservations.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          No tienes reservas registradas todavía. ¡Elige una estación y vive la experiencia gamer!
        </td>
      </tr>
      `;
    setupEditButtons();
    updateReservationPagination();
    return;
  }

  currentReservations.forEach(res => {
    let statusClass = 'badge-cyan';
    if (res.status === 'confirmada') statusClass = 'badge-green';
    if (res.status === 'finalizada') statusClass = 'badge-purple';
    if (res.status === 'cancelada') statusClass = 'badge-red';

    const acciones = [
      `<button class="btn btn-outline btn-sm btn-detail-res" data-id="${res.id}">Detalle</button>`
    ];
    if (res.status === 'confirmada') {
      acciones.push(`<button class="btn btn-outline btn-sm btn-edit-res" data-id="${res.id}">Editar ✏️</button>`);
      acciones.push(`<button class="btn btn-danger btn-sm btn-cancel-res" data-id="${res.id}">Cancelar</button>`);
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong style="color: var(--text-primary);">${res.id}</strong></td>
      <td><span style="font-weight: 600; color: var(--text-primary);">${res.stationName}</span></td>
      <td>${res.date} • ${res.time}</td>
      <td>${res.durationHours} hora(s)</td>
      <td><span style="color: var(--neon-cyan); font-weight: 700;">$${Number(res.totalPrice).toLocaleString('es-CO')}</span></td>
      <td class="reservation-user"></td>
      <td><span class="badge ${statusClass}">${res.status.toUpperCase()}</span></td>
      <td>
        ${acciones.join(' ')}
      </td>
    `;
    const userName = res.user && res.user.name
      ? res.user.name
      : AuthManager.getCurrentUser().fullName;
    tr.querySelector('.reservation-user').textContent = userName;
    tableBody.appendChild(tr);
  });

  tableBody.querySelectorAll('.btn-cancel-res').forEach(btn => {
    btn.addEventListener('click', () => cancelReservation(btn.getAttribute('data-id')));
  });
  tableBody.querySelectorAll('.btn-detail-res').forEach(btn => {
    btn.addEventListener('click', () => showReservationDetails(btn.getAttribute('data-id')));
  });
  setupEditButtons();
  updateReservationPagination();
}

async function loadReservations() {
  const tableBody = document.getElementById('reservations-tbody');
  if (tableBody) {
    tableBody.innerHTML = '<tr>    <td colspan="8" style="text-align:center; padding:2rem;">Cargando tus reservas...</td></tr>';
  }

  try {
    const params = new URLSearchParams({
      page: String(reservationPage),
      limit: '10'
    });
    const search = document.getElementById('reservation-search');
    const dateFrom = document.getElementById('reservation-date-from');
    const dateTo = document.getElementById('reservation-date-to');
    const status = document.getElementById('reservation-status');
    if (search && search.value.trim()) params.set('q', search.value.trim());
    if (dateFrom && dateFrom.value) params.set('dateFrom', dateFrom.value);
    if (dateTo && dateTo.value) params.set('dateTo', dateTo.value);
    if (status && status.value) params.set('status', status.value);

    const response = await APIClient.get(`/reservations?${params.toString()}`);
    if (reservationPage > response.totalPaginas) {
      reservationPage = response.totalPaginas;
      await loadReservations();
      return;
    }
    currentReservations = response.reservas;
    reservationTotalPages = response.totalPaginas;
    activeReservationsCount = response.reservasActivas;
    renderReservations();
    renderStats(AuthManager.getCurrentUser());
  } catch (error) {
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:2rem;"></td></tr>';
      tableBody.querySelector('td').textContent = error.message;
    }
    showToast(error.message, 'error');
  }
}

function setupReservationFilters() {
  const form = document.getElementById('reservation-filters');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const dateFrom = document.getElementById('reservation-date-from').value;
      const dateTo = document.getElementById('reservation-date-to').value;
      if (dateFrom && dateTo && dateFrom > dateTo) {
        showToast('La fecha final debe ser igual o posterior a la fecha inicial.', 'warning');
        return;
      }
      reservationPage = 1;
      loadReservations();
    });
  }

  const previous = document.getElementById('reservations-previous');
  const next = document.getElementById('reservations-next');
  if (previous) previous.addEventListener('click', () => {
    if (reservationPage > 1) {
      reservationPage -= 1;
      loadReservations();
    }
  });
  if (next) next.addEventListener('click', () => {
    if (reservationPage < reservationTotalPages) {
      reservationPage += 1;
      loadReservations();
    }
  });
}

function updateReservationPagination() {
  const pageLabel = document.getElementById('reservations-page-label');
  const previous = document.getElementById('reservations-previous');
  const next = document.getElementById('reservations-next');
  if (pageLabel) pageLabel.textContent = `Página ${reservationPage} de ${reservationTotalPages}`;
  if (previous) previous.disabled = reservationPage <= 1;
  if (next) next.disabled = reservationPage >= reservationTotalPages;
}

async function showReservationDetails(id) {
  try {
    const response = await APIClient.get(`/reservations/${encodeURIComponent(id)}`);
    const reserva = response.reserva;
    alert(
      `Reserva ${reserva.id}\n` +
      `Estación: ${reserva.stationName}\n` +
      `Fecha: ${reserva.date}\n` +
      `Hora: ${reserva.time}\n` +
      `Duración: ${reserva.durationHours} hora(s)\n` +
      `Valor: $${Number(reserva.totalPrice).toLocaleString('es-CO')} COP\n` +
      `Estado: ${reserva.status}\n` +
      `Observaciones: ${reserva.observations || 'Sin observaciones'}`
    );
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function cancelReservation(id) {
  const reserva = currentReservations.find(r => r.id === id);
  if (!reserva) {
    showToast('No se encontró la reserva', 'error');
    return;
  }
  const confirmacion = `¿Deseas cancelar la reserva ${id}?\n\n${reserva.stationName}\n${reserva.date} • ${reserva.time}`;
  if (!confirm(confirmacion)) return;

  try {
    const response = await APIClient.patch(`/reservations/${encodeURIComponent(id)}/cancel`);
    await loadReservations();
    showToast(response.mensaje, 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// HUS-08: abre el modal precargando los datos de la reserva a editar
function openEditModal(reservationId) {
  const reserva = currentReservations.find(r => r.id === reservationId);
  if (!reserva) {
    showToast('No se encontró la reserva', 'error');
    return;
  }
  editingReservationId = reservationId;
  openBookingModal(reserva.stationId, reserva);
}

// HUS-08: conecta los botones de editar en cada fila del historial
function setupEditButtons() {
  const tableBody = document.getElementById('reservations-tbody');
  if (!tableBody) return;
  tableBody.querySelectorAll('.btn-edit-res').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
  });
}

// 6. Modal de Nueva Reserva
function setupBookingModal() {
  const modalOverlay = document.getElementById('booking-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const openHeroBtn = document.getElementById('btn-open-booking');
  const bookingForm = document.getElementById('booking-form');

  if (openHeroBtn) {
    openHeroBtn.addEventListener('click', () => openBookingModal());
  }

  if (closeBtn) closeBtn.addEventListener('click', closeBookingModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeBookingModal);

  // Cerrar al hacer clic en el fondo
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeBookingModal();
    });
  }

  // Actualizar cálculo de precio al cambiar estación o duración
  const stationSelect = document.getElementById('book-station');
  const durationSelect = document.getElementById('book-duration');
  const dateInput = document.getElementById('book-date');

  if (stationSelect && durationSelect) {
    stationSelect.addEventListener('change', updateModalPrice);
    durationSelect.addEventListener('change', updateModalPrice);
  }
  if (dateInput) dateInput.addEventListener('change', updateTimeOptions);

  // Enviar reserva
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await createReservation();
    });
  }
}

function openBookingModal(preselectedStationId = null, reservaAEditar = null) {
  const modal = document.getElementById('booking-modal');
  const modalTitle = document.getElementById('modal-title');
  const submitBtn = document.getElementById('btn-submit-booking');
  const stationSelect = document.getElementById('book-station');
  const dateInput = document.getElementById('book-date');
  const timeSelect = document.getElementById('book-time');
  const durationSelect = document.getElementById('book-duration');
  const observationsInput = document.getElementById('book-observations');
  if (!reservaAEditar) editingReservationId = null;

  if (stationSelect) {
    stationSelect.innerHTML = currentStations
      .map(s => `
        <option value="${s.id}" ${preselectedStationId === s.id ? 'selected' : ''}>
          ${s.name} - $${s.pricePerHour.toLocaleString('es-CO')}/h
        </option>
      `).join('');
  }
  // HUS-08: precargar los datos de la reserva que se está editando
  if (reservaAEditar) {
    if (modalTitle) modalTitle.textContent = 'Editar Reserva ✏️';
    if (submitBtn) submitBtn.textContent = 'Guardar Cambios 💾';
    if (dateInput) {
      dateInput.value = reservaAEditar.dateRaw || getLocalDate();
      dateInput.min = getLocalDate();
    }
    if (timeSelect && reservaAEditar.time) {
      const horaInicio = reservaAEditar.time.split(' - ')[0];
      const opcion = timeSelect.querySelector(`option[value^="${horaInicio}"]`);
      if (opcion) timeSelect.value = opcion.value;
    }
    if (durationSelect) durationSelect.value = String(reservaAEditar.durationHours || 2);
    if (observationsInput) observationsInput.value = reservaAEditar.observations || '';
  } else {
    if (modalTitle) modalTitle.textContent = 'Reservar Estación Gamer 🎮';
    if (submitBtn) submitBtn.textContent = 'Confirmar Reserva 🚀';
    if (dateInput) {
      const today = getLocalDate();
      dateInput.value = today;
      dateInput.min = today;
    }
    if (observationsInput) observationsInput.value = '';
  }
  updateTimeOptions();
  updateModalPrice();
  if (modal) {
    modal.classList.add('active');
  }
}

function getLocalDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function updateTimeOptions() {
  const dateInput = document.getElementById('book-date');
  const timeSelect = document.getElementById('book-time');
  if (!dateInput || !timeSelect) return;

  const selectedDate = dateInput.value;
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  Array.from(timeSelect.options).forEach(option => {
    const hour = Number(option.value.slice(0, 2));
    option.disabled = selectedDate === getLocalDate() &&
      (hour < currentHour || (hour === currentHour && currentMinute > 0));
  });
  if (timeSelect.selectedOptions[0] && timeSelect.selectedOptions[0].disabled) {
    const firstFutureTime = Array.from(timeSelect.options).find(option => !option.disabled);
    if (firstFutureTime) timeSelect.value = firstFutureTime.value;
  }
}

function closeBookingModal() {
  editingReservationId = null;
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function updateModalPrice() {
  const stationSelect = document.getElementById('book-station');
  const durationSelect = document.getElementById('book-duration');
  const priceDisplay = document.getElementById('modal-total-price');

  if (!stationSelect || !durationSelect || !priceDisplay) return;

  const station = currentStations.find(s => s.id === stationSelect.value);
  const hours = parseInt(durationSelect.value, 10) || 1;

  if (station) {
    const total = station.pricePerHour * hours;
    priceDisplay.textContent = `$${total.toLocaleString('es-CO')} COP`;
  }
}

// HUS-06 y HUS-08: crear o actualizar una reserva según el modo del modal
async function createReservation() {
  const stationSelect = document.getElementById('book-station');
  const dateInput = document.getElementById('book-date');
  const timeSelect = document.getElementById('book-time');
  const durationSelect = document.getElementById('book-duration');
  const observationsInput = document.getElementById('book-observations');

  // Validaciones (HUS-06 / HUS-08)
  if (!stationSelect.value) {
    showToast('Selecciona una estación válida', 'error');
    return;
  }
  if (!dateInput.value) {
    showToast('Selecciona una fecha para la reserva', 'warning');
    return;
  }
  if (dateInput.value < getLocalDate()) {
    showToast('No puedes reservar en una fecha pasada', 'error');
    return;
  }

  const station = currentStations.find(s => s.id === stationSelect.value);
  if (!station) {
    showToast('Selecciona una estación válida', 'error');
    return;
  }

  const hours = parseInt(durationSelect.value, 10);
  const payload = {
    stationId: station.id,
    date: dateInput.value,
    time: timeSelect.value,
    durationHours: hours,
    observations: observationsInput ? observationsInput.value.trim() : ''
  };
  const submitBtn = document.getElementById('btn-submit-booking');
  const originalText = submitBtn.textContent;
  if (editingReservationId && !confirm('¿Está seguro de actualizar esta reserva?')) return;

  submitBtn.disabled = true;
  submitBtn.textContent = editingReservationId ? 'Guardando cambios...' : 'Creando reserva...';
  try {
    const response = editingReservationId
      ? await APIClient.put(`/reservations/${encodeURIComponent(editingReservationId)}`, payload)
      : await APIClient.post('/reservations', payload);
    editingReservationId = null;
    closeBookingModal();
    await loadReservations();
    showToast(response.mensaje, 'success');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// 7. Cerrar sesión
function setupLogout() {
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      AuthManager.logout();
    });
  }
}
