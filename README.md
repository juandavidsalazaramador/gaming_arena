<<<<<<< HEAD
# 🎮 Gaming Arena - Sistema de Gestión y Reservas

Aplicación web para la gestión de reservas de puestos de videojuegos de alto rendimiento (PC Gamer VIP, Consolas 4K y Simuladores de Carreras / VR).

---

## 👥 Equipo y Roles — Sprint 1

| Rol | Integrante | Responsabilidad Principal |
| :--- | :--- | :--- |
| **Frontend** | **Camilo** | Interfaz de usuario, pantallas, estilos visuales gamer, validaciones en cliente y preparación para el consumo de API. |
| **Backend** | Por asignar | Node.js + Express, API REST, MongoDB, modelos y autenticación. |
| **Integración / DevOps** | JP | Git/GitHub, repositorio, ramas, Pull Requests, Code Review y despliegue. |

---

## 🚀 Entregables del Sprint 1 (Frontend)

Para este Sprint se han implementado las 3 Historias de Usuario principales con una estética gamer moderna (Cyberpunk / Esports Dark Theme, Neón Cyan & Purple, Glassmorphism):

### 1. HUS-01: Pantalla de Login (`frontend/login.html`)
- Formulario de autenticación para jugadores.
- Validación de campos en tiempo real (correo válido o alias, contraseña mínima).
- Botón interactivo para mostrar/ocultar contraseña.
- Alertas dinámicas tipo Toast y redirección automática al Dashboard.
- Enlace directo a la vista de Registro.

### 2. HUS-02: Pantalla de Registro (`frontend/register.html`)
- Registro de nuevos jugadores (GamerTag único, Nombre completo, Correo, Contraseña y Confirmación).
- Medidor en tiempo real de seguridad de la contraseña (*Débil*, *Regular*, *Buena*, *Excelente*).
- Validación de coincidencia de contraseñas y aceptación de código de conducta gamer.
- Asignación de 500 Arena Coins de bienvenida al registrarse.

### 3. HUS-03: Dashboard Gaming Arena (`frontend/dashboard.html`)
- Barra de navegación con perfil de usuario (@GamerTag, Rango Platino, saldo de Arena Coins y botón de Salir).
- Tarjetas de métricas: Reservas activas, Saldo de puntos, Horas acumuladas y Próxima sesión.
- Catálogo de Estaciones de Juego con filtros interactivos:
  - 🖥️ PC Gamer VIP (RTX 4090, i9-14900K, 240Hz OLED)
  - 🎮 Consolas 4K (PlayStation 5 & Xbox Series X)
  - 🏎️ VR & Sim Racing (Cockpits Fanatec y Meta Quest 3)
- Modal interactivo de **Nueva Reserva**:
  - Selección de hardware, fecha, hora y duración.
  - Cálculo dinámico del precio en COP y acreditación de puntos.
- Tabla de **Historial y Reservas Activas** con opción de cancelación instantánea.

---

## 📁 Estructura del Frontend

```text
SPRINT1_AGUIRRE/
├── frontend/
│   ├── index.html               # Redirección inicial
│   ├── login.html               # HUS-01: Iniciar Sesión
│   ├── register.html            # HUS-02: Registro de Jugador
│   ├── dashboard.html           # HUS-03: Dashboard Principal
│   ├── css/
│   │   ├── main.css             # Design System, variables CSS, fuentes y componentes globales
│   │   ├── auth.css             # Estilos para Login y Registro
│   │   └── dashboard.css        # Estilos para Dashboard, catálogo y modal
│   └── js/
│       ├── config.js            # Configuración de API Backend y mock data
│       ├── auth.js              # Validaciones de formularios de autenticación
│       └── dashboard.js         # Interactividad del Dashboard y reservas
├── .gitignore
└── README.md
```

---

## 🛠️ Cómo Probar la Aplicación Localmente

1. Puedes abrir directamente cualquiera de los archivos `.html` en tu navegador web preferido:
   - Para empezar en el login: abrir `frontend/login.html`
   - O abrir `frontend/dashboard.html` directamente para explorar el panel.
2. También puedes usar una extensión como **Live Server** en VS Code o cualquier servidor HTTP local:
   ```bash
   npx serve frontend
   ```

---

## 🌿 Flujo de Git para Camilo

```bash
# 1. Crear la rama de trabajo para el Frontend
git checkout -b feature/frontend-sprint1

# 2. Agregar los archivos
git add .

# 3. Realizar los commits
git commit -m "feat(frontend): implement login, register and dashboard views for sprint 1 (HUS-01, HUS-02, HUS-03)"

# 4. Subir la rama a GitHub (cuando JP comparta el remoto)
git push -u origin feature/frontend-sprint1
```
=======
# Gaming Arena

Proyecto desarrollado para el Sprint 1.
>>>>>>> origin/main
