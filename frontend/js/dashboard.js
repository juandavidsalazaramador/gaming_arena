/* ========================================================
   GAMING ARENA - LÓGICA DEL DASHBOARD (HUS-03)
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Asegurar sesión activa
  initDashboard();
});

let currentStations = [];
let currentReservations = [];

function initDashboard() {
  const user = AuthManager.getCurrentUser() || {
    gamerTag: 'CamiloProGamer',
    fullName: 'Camilo Aguirre',
    email: 'camilo@gamingarena.com',
    tier: 'Rango Platino',
    coins: 1450
  };

  // Cargar datos desde localStorage
  currentStations = JSON.parse(localStorage.getItem(CONFIG.STATIONS_KEY)) || INITIAL_STATIONS;
  currentReservations = JSON.parse(localStorage.getItem(CONFIG.RESERVATIONS_KEY)) || INITIAL_RESERVATIONS;

  renderUserHeader(user);
  renderStats(user);
  renderStations('all');
  renderReservations();
  setupFilterTabs();
  setupBookingModal();
  setupLogout();
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
  if (coinsEl) coinsEl.textContent = `${user.coins || 0} Coins`;
  if (avatarEl) avatarEl.textContent = (user.gamerTag || 'G').charAt(0).toUpperCase();

  const heroWelcome = document.getElementById('hero-welcome-text');
  if (heroWelcome) {
    heroWelcome.textContent = `¡Listo para jugar, ${user.gamerTag}! ⚡`;
  }
}

// 2. Métricas rápidas
function renderStats(user) {
  const activeReservationsCount = currentReservations.filter(r => r.status === 'confirmada' || r.status === 'en curso').length;
  
  const activeResEl = document.getElementById('stat-active-reservations');
  const totalCoinsEl = document.getElementById('stat-total-coins');
  const hoursPlayedEl = document.getElementById('stat-hours-played');
  const nextSessionEl = document.getElementById('stat-next-session');

  if (activeResEl) activeResEl.textContent = activeReservationsCount;
  if (totalCoinsEl) totalCoinsEl.textContent = `${user.coins || 1450} 🪙`;
  if (hoursPlayedEl) hoursPlayedEl.textContent = '32.5 hrs';
  
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
          <button class="btn ${isAvailable ? 'btn-primary' : 'btn-outline'} btn-sm btn-book" 
                  data-id="${station.id}" 
                  ${!isAvailable ? 'disabled title="Estación ocupada actualmente"' : ''}>
            ${isAvailable ? 'Reservar 🎮' : 'En Uso'}
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
        <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          No tienes reservas registradas todavía. ¡Elige una estación y vive la experiencia gamer!
        </td>
      </tr>
    `;
    return;
  }

  currentReservations.forEach(res => {
    let statusClass = 'badge-cyan';
    if (res.status === 'confirmada') statusClass = 'badge-green';
    if (res.status === 'finalizada') statusClass = 'badge-purple';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong style="color: var(--text-primary);">${res.id}</strong></td>
      <td>
        <span style="font-weight: 600; color: var(--text-primary);">${res.stationName}</span>
      </td>
      <td>${res.date} • ${res.time}</td>
      <td>${res.durationHours} hora(s)</td>
      <td><span style="color: var(--neon-cyan); font-weight: 700;">$${res.totalPrice.toLocaleString('es-CO')}</span></td>
      <td><span class="badge ${statusClass}">${res.status.toUpperCase()}</span></td>
      <td>
        ${res.status === 'confirmada' ? `
          <button class="btn btn-danger btn-sm btn-cancel-res" data-id="${res.id}">
            Cancelar
          </button>
        ` : `
          <span style="font-size: 0.8rem; color: var(--text-muted);">Completada</span>
        `}
      </td>
    `;
    tableBody.appendChild(tr);
  });

  // Cancelar reserva
  tableBody.querySelectorAll('.btn-cancel-res').forEach(btn => {
    btn.addEventListener('click', () => {
      const resId = btn.getAttribute('data-id');
      cancelReservation(resId);
    });
  });
}

function cancelReservation(id) {
  if (confirm(`¿Deseas cancelar la reserva ${id}?`)) {
    currentReservations = currentReservations.filter(r => r.id !== id);
    localStorage.setItem(CONFIG.RESERVATIONS_KEY, JSON.stringify(currentReservations));
    renderReservations();
    renderStats(AuthManager.getCurrentUser());
    showToast(`Reserva ${id} cancelada`, 'info');
  }
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

  if (stationSelect && durationSelect) {
    stationSelect.addEventListener('change', updateModalPrice);
    durationSelect.addEventListener('change', updateModalPrice);
  }

  // Enviar reserva
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      createReservation();
    });
  }
}

function openBookingModal(preselectedStationId = null) {
  const modal = document.getElementById('booking-modal');
  const stationSelect = document.getElementById('book-station');
  const dateInput = document.getElementById('book-date');

  // Llenar select de estaciones disponibles
  if (stationSelect) {
    stationSelect.innerHTML = currentStations
      .filter(s => s.status === 'disponible')
      .map(s => `
        <option value="${s.id}" ${preselectedStationId === s.id ? 'selected' : ''}>
          ${s.name} - $${s.pricePerHour.toLocaleString('es-CO')}/h
        </option>
      `).join('');
  }

  // Poner fecha de hoy por defecto
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;
  }

  updateModalPrice();

  if (modal) {
    modal.classList.add('active');
  }
}

function closeBookingModal() {
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

function createReservation() {
  const stationSelect = document.getElementById('book-station');
  const dateInput = document.getElementById('book-date');
  const timeSelect = document.getElementById('book-time');
  const durationSelect = document.getElementById('book-duration');

  const station = currentStations.find(s => s.id === stationSelect.value);
  if (!station) {
    showToast('Selecciona una estación válida', 'error');
    return;
  }

  const hours = parseInt(durationSelect.value, 10);
  const total = station.pricePerHour * hours;
  const newId = `RES-${Math.floor(1000 + Math.random() * 9000)}`;

  const newRes = {
    id: newId,
    stationId: station.id,
    stationName: station.name,
    date: dateInput.value || 'Hoy',
    time: timeSelect.value,
    durationHours: hours,
    totalPrice: total,
    status: 'confirmada'
  };

  currentReservations.unshift(newRes);
  localStorage.setItem(CONFIG.RESERVATIONS_KEY, JSON.stringify(currentReservations));

  // Otorgar 50 coins por reservar
  const user = AuthManager.getCurrentUser();
  if (user) {
    user.coins = (user.coins || 0) + 50;
    AuthManager.setCurrentUser(user);
    renderUserHeader(user);
  }

  closeBookingModal();
  renderReservations();
  renderStats(user);

  showToast(`¡Reserva ${newId} confirmada exitosamente! Ganaste +50 Coins 🪙`, 'success');
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
