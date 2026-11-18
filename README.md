# Gaming Arena

Aplicación web para que los clientes consulten estaciones de juego y creen,
consulten, actualicen y cancelen sus reservas. El proyecto se desarrolló en
equipo durante tres sprints con Git, GitHub, Issues, Pull Requests y GitHub
Projects.

## Integrantes

- `juandavidsalazaramador`
- `silviadanielafigueroalozano5-art`
- `camxor20-lab`

Los roles de Frontend, Backend e Integración/DevOps rotan por sprint según la
guía del taller. El rol del sprint define la responsabilidad principal, pero
todo el equipo participa en el flujo de Git y GitHub.

## Tecnologías y arquitectura

- **Frontend:** HTML, CSS y JavaScript en `frontend/`.
- **Backend:** Node.js y Express en `backend/`, organizado en rutas,
  controladores, modelos, validadores y middleware.
- **Base de datos:** MongoDB con Mongoose. Los modelos principales son
  `Usuario`, `Servicio` y `Reserva`.
- **Autenticación:** JWT y contraseñas almacenadas con bcrypt.
- **Colaboración y automatización:** Git, GitHub Issues, Pull Requests,
  GitHub Projects y GitHub Actions.

El frontend consume la API REST del backend. La URL base de la API se configura
en `frontend/js/config.js`; por defecto es `http://localhost:4000/api`.
Para una explicación detallada de cada capa y de las funciones conectadas,
consulta [ARQUITECTURA.md](./ARQUITECTURA.md).

## Funcionalidades y API

| Funcionalidad | Endpoints principales |
|---|---|
| Iniciar sesión (HUS-01) | `POST /api/auth/login` |
| Registrar usuario (HUS-02) | `POST /api/usuarios` |
| Dashboard y perfil (HUS-03) | `GET /api/dashboard` |
| Gestión de usuarios (HUS-04) | En el código revisado solo se verificó `POST /api/usuarios`; confirmar con el equipo el resto del CRUD y sus criterios. |
| Servicios (HUS-05) | Hay modelo, controlador y rutas preparados, pero `servicio.routes.js` no está montado en `backend/routes/index.js`; esos endpoints no están disponibles actualmente. |
| Crear reserva (HUS-06) | `POST /api/reservations` |
| Consultar reservas (HUS-07) | `GET /api/reservations`, `GET /api/reservations/:id` |
| Actualizar reserva (HUS-08) | `PUT /api/reservations/:id` |
| Cancelar reserva (HUS-09) | `PATCH /api/reservations/:id/cancel` |
| Estado del servidor | `GET /health` |

Las rutas de reservas requieren autenticación. La API valida disponibilidad,
evita solapamientos horarios y guarda el precio calculado desde el catálogo del
servidor.

El estado de cada HUS debe corresponder al avance comprobado por el equipo en
el tablero; la presencia de un endpoint por sí sola no demuestra que todos sus
criterios de aceptación estén terminados.

El dashboard responde con información del usuario autenticado. Confirmen
durante la sustentación qué métricas del sistema muestra la interfaz y cuáles
siguen siendo datos de demostración o no están disponibles en la API.

## Instalación y ejecución

Requisitos: Node.js 20 o superior y MongoDB local o una URI de MongoDB Atlas.

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Edita `backend/.env` con los datos del entorno:

| Variable | Descripción | Ejemplo local |
|---|---|---|
| `PORT` | Puerto del servidor | `4000` |
| `MONGODB_URI` | URI de MongoDB | `mongodb://127.0.0.1:27017/gaming_arena` |
| `JWT_SECRET` | Secreto para firmar tokens; usa un valor propio y privado | No compartir |
| `JWT_EXPIRES_IN` | Vigencia del token | `7d` |
| `ADMIN_EMAIL` | Correo de la cuenta administradora inicial | `admin@test-arena.com` |
| `ADMIN_PASSWORD` | Contraseña de la cuenta administradora inicial | `adminPassword123` |

Al iniciar, el backend crea o sincroniza esta cuenta en MongoDB y puede iniciar
sesión desde `/api/auth/login`. Si ya existe un usuario con ese correo, se le
asigna el rol administrador y se establece la contraseña configurada. Cambia
ambas variables por valores únicos y seguros en cualquier entorno compartido o
de producción; la cuenta predeterminada es conocida y se restablece al arrancar.

Para ejecutar las pruebas automatizadas disponibles:

```powershell
cd backend
npm test
```

## Git, Issues y GitHub Projects

El equipo utiliza `main` como rama estable, `develop` para integración y ramas
de trabajo `feature/*` y `fix/*`. El flujo esperado es:

`Issue/HUS → rama → commits → Pull Request → revisión → Actions → integración`

El tablero del equipo es [Arena de juegos en GitHub Projects](https://github.com/users/juandavidsalazaramador/projects).
En la vista compartida se observan los estados **Hacer**, **En curso** y
**Hecho**. Cada tarjeta debe reflejar el estado real de su Issue y tener
responsable; antes de marcar una HUS como hecha, el equipo debe comprobar sus
criterios y la integración correspondiente.

## GitHub Actions

Los workflows del repositorio se encuentran en `.github/workflows/` y se
pueden consultar en [GitHub Actions](https://github.com/juandavidsalazaramador/gaming_arena/actions).
Al revisar el historial publicado el 3 de noviembre de 2026, se observó que:

- El workflow **Gaming Arena CI** terminó correctamente, pero su ejecución solo
  descargó el repositorio e imprimió mensajes; no ejecutó las pruebas del
  proyecto.
- El workflow **CI** terminó con error durante la configuración de Node.js; los
  pasos de instalación y pruebas quedaron omitidos.

Por lo tanto, esos resultados no demuestran que las pruebas del proyecto hayan
pasado en GitHub. Revisar la ejecución más reciente antes de presentar el CI
como verificado.

## Evidencias del taller

- Issues e historial: [Issues del repositorio](https://github.com/juandavidsalazaramador/gaming_arena/issues).
- Pull Requests y revisiones: [Pull Requests](https://github.com/juandavidsalazaramador/gaming_arena/pulls).
- Tablero y tarjetas: [GitHub Projects](https://github.com/users/juandavidsalazaramador/projects).
- Ejecuciones automatizadas: [GitHub Actions](https://github.com/juandavidsalazaramador/gaming_arena/actions).
