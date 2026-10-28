/* ========================================================
   GAMING ARENA - CONFIG & UTILITIES (SPRINT 1)
   ======================================================== */

// Configuración de endpoints (Preparado para conectar con Node.js + Express en Backend)
const CONFIG = {
  API_BASE_URL: 'http://localhost:5000/api', // Ruta de la API de Node.js
  AUTH_TOKEN_KEY: 'gaming_arena_token',
  USER_DATA_KEY: 'gaming_arena_user',
  RESERVATIONS_KEY: 'gaming_arena_reservations',
  STATIONS_KEY: 'gaming_arena_stations'
};

// Notificaciones Toast flotantes
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: '🎮'
  };

  toast.innerHTML = `
    <span>${iconMap[type] || '⚡'}</span>
    <span style="flex: 1; font-weight: 500;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Gestión de Sesión y Autenticación del Gamer
const AuthManager = {
  getCurrentUser() {
    const raw = localStorage.getItem(CONFIG.USER_DATA_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setCurrentUser(userData, token = 'mock_jwt_token_' + Date.now()) {
    localStorage.setItem(CONFIG.USER_DATA_KEY, JSON.stringify(userData));
    localStorage.setItem(CONFIG.AUTH_TOKEN_KEY, token);
  },

  isAuthenticated() {
    return !!localStorage.getItem(CONFIG.AUTH_TOKEN_KEY);
  },

  logout() {
    localStorage.removeItem(CONFIG.USER_DATA_KEY);
    localStorage.removeItem(CONFIG.AUTH_TOKEN_KEY);
    showToast('Sesión cerrada correctamente', 'info');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 800);
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
    }
  },

  redirectIfAuthenticated() {
    if (this.isAuthenticated()) {
      window.location.href = 'dashboard.html';
    }
  }
};

// Datos iniciales de Estaciones de Juego de Gaming Arena
const INITIAL_STATIONS = [
  {
    id: 'pc-01',
    name: 'PC Master Race #01 (VIP)',
    category: 'pc',
    specs: ['RTX 4090 24GB VRAM', 'Intel Core i9-14900K', 'Monitor OLED 240Hz 27" QHD', 'Periféricos Mecánicos RGB'],
    pricePerHour: 12000,
    status: 'disponible', // disponible, ocupado, reservado
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'pc-02',
    name: 'PC Master Race #02',
    category: 'pc',
    specs: ['RTX 4080 Super 16GB', 'AMD Ryzen 7 7800X3D', 'Monitor 280Hz Fast IPS 24.5"', 'Teclado Óptico 8000Hz'],
    pricePerHour: 10000,
    status: 'disponible',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'console-01',
    name: 'PlayStation 5 Lounge 4K',
    category: 'consolas',
    specs: ['PS5 Digital + DualSense Edge', 'TV OLED LG C3 55" 120Hz VRR', 'Sofá Reclinable Gamer', 'Catálogo PS Plus Extra'],
    pricePerHour: 9000,
    status: 'disponible',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'console-02',
    name: 'Xbox Series X Arena',
    category: 'consolas',
    specs: ['Xbox Series X 1TB + Elite Controller', 'TV OLED 55" Dolby Vision', 'Xbox Game Pass Ultimate', 'Sonido Envolvente Dolby Atmos'],
    pricePerHour: 9000,
    status: 'ocupado',
    image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'sim-01',
    name: 'Cockpit Sim Racing Pro',
    category: 'simuladores',
    specs: ['Volante Fanatec Direct Drive 8Nm', 'Pedales Celda de Carga', 'Triple Monitor Curvo 165Hz', 'F1 24, Assetto Corsa & iRacing'],
    pricePerHour: 16000,
    status: 'disponible',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'vr-01',
    name: 'Cabina Inmersiva VR 360°',
    category: 'simuladores',
    specs: ['Meta Quest 3 + Meta link 5Gbps', 'Área de juego libre 3x3m acolchada', 'Beat Saber, Half-Life Alyx & Superhot', 'Pantalla externa de espectadores'],
    pricePerHour: 15000,
    status: 'disponible',
    image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=700&q=80'
  }
];

// Reservas iniciales de demostración
const INITIAL_RESERVATIONS = [
  {
    id: 'RES-8921',
    stationId: 'pc-01',
    stationName: 'PC Master Race #01 (VIP)',
    date: 'Hoy',
    time: '18:00 - 20:00',
    durationHours: 2,
    totalPrice: 24000,
    status: 'confirmada' // confirmada, en curso, finalizada
  },
  {
    id: 'RES-8919',
    stationId: 'console-01',
    stationName: 'PlayStation 5 Lounge 4K',
    date: 'Ayer',
    time: '16:00 - 18:00',
    durationHours: 2,
    totalPrice: 18000,
    status: 'finalizada'
  }
];

// Inicializar almacenamiento local si no existe
function initLocalStorageData() {
  if (!localStorage.getItem(CONFIG.STATIONS_KEY)) {
    localStorage.setItem(CONFIG.STATIONS_KEY, JSON.stringify(INITIAL_STATIONS));
  }
  if (!localStorage.getItem(CONFIG.RESERVATIONS_KEY)) {
    localStorage.setItem(CONFIG.RESERVATIONS_KEY, JSON.stringify(INITIAL_RESERVATIONS));
  }
  // Si no hay usuario activo, crear uno por defecto para visualización directa
  if (!AuthManager.getCurrentUser()) {
    AuthManager.setCurrentUser({
      gamerTag: 'CamiloProGamer',
      fullName: 'Camilo Aguirre',
      email: 'camilo@gamingarena.com',
      tier: 'Rango Platino',
      coins: 1450,
      avatarUrl: ''
    });
  }
}

initLocalStorageData();
