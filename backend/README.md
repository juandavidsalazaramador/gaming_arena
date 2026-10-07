# 🎮 Gaming Arena - API Backend

Backend oficial de la plataforma **Gaming Arena**, diseñado para la gestión integral de autenticación, usuarios, roles, métricas de dashboard y catálogo de servicios (torneos, alquiler de estaciones de juego, coaching y más).

Construido con **Node.js**, **Express 4**, **Mongoose 8** y **MongoDB**, siguiendo una arquitectura modular en capas con convenciones estrictas de código limpio y mensajes en español.

---

## 🛠️ Tecnologías y Dependencias

- **Entorno de Ejecución:** Node.js (CommonJS)
- **Framework Web:** Express 4.21
- **Base de Datos:** MongoDB con ODM Mongoose 8.9
- **Autenticación y Seguridad:**
  - JSON Web Tokens (`jsonwebtoken`)
  - Hashing de contraseñas con sal (`bcryptjs`)
- **Validaciones Declarativas:** `express-validator` 7.2
- **Logging y CORS:** `morgan` y `cors`
- **Monitoreo y DevOps:** GitHub Actions CI, validación sintáctica cruzada con `node --check`

---

## 🚀 Requisitos Previos e Instalación

### 1. Requisitos
- Node.js $\ge$ 18.x (recomendado v20.x o v22.x)
- MongoDB Server $\ge$ 6.x activo localmente o URI de MongoDB Atlas
- Git instalado

### 2. Clonar el repositorio e instalar dependencias
```bash
git clone <url-del-repositorio>
cd SPRINT2.BACKEND
npm install
```

### 3. Configuración de Variables de Entorno
Copia la plantilla `.env.example` en un nuevo archivo `.env`:

```bash
cp .env.example .env
```

Configura los valores correspondientes en tu `.env`:

| Variable | Descripción | Valor por Defecto / Ejemplo |
|----------|-------------|-----------------------------|
| `PORT` | Puerto de escucha del servidor Express | `4000` |
| `MONGODB_URI` | Cadena de conexión a la base de datos | `mongodb://127.0.0.1:27017/gaming_arena` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `tu_secreto_super_seguro_jwt` |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token JWT | `7d` |

### 4. Iniciar la Aplicación
- **Modo Desarrollo (con recarga automática):**
  ```bash
  npm run dev
  ```
- **Modo Producción:**
  ```bash
  npm start
  ```
- **Verificación de Sintaxis e Integridad (CI):**
  ```bash
  npm run check
  ```
- **Ejecución de Pruebas:**
  ```bash
  npm test
  ```

---

## 📋 Catálogo Completo de Endpoints

### 🩺 Health Check
| Método | Ruta | Rol Requerido | Descripción | Códigos HTTP |
|:------:|:-----|:-------------:|:------------|:------------:|
| `GET` | `/health` | Público | Estado y tiempo de actividad del servidor | `200` |

---

### 🔐 Autenticación y Dashboard (Sprint 1)
| Método | Ruta | Rol Requerido | Descripción | Códigos HTTP |
|:------:|:-----|:-------------:|:------------|:------------:|
| `POST` | `/api/auth/login` | Público | Iniciar sesión y obtener token JWT | `200`, `400`, `401` |
| `GET` | `/api/dashboard` | Autenticado (Cualquiera) | Información de bienvenida y perfil resumido | `200`, `401` |

---

### 👤 Usuarios (Sprint 1 y Sprint 2)
| Método | Ruta | Rol Requerido | Descripción | Códigos HTTP |
|:------:|:-----|:-------------:|:------------|:------------:|
| `POST` | `/api/usuarios` | Público / Admin | Registrar usuario. Si no hay admin autenticado, fuerza rol `cliente` | `201`, `400`, `409` |
| `GET` | `/api/usuarios` | `administrador` | Listar usuarios con paginación (`page`, `limit`), filtro por `rol` y búsqueda `q` | `200`, `400`, `401`, `403` |
| `GET` | `/api/usuarios/:id` | `administrador` o propio usuario | Consultar detalle de un usuario por su ID | `200`, `400`, `401`, `403`, `404` |
| `DELETE` | `/api/usuarios/:id` | `administrador` | Eliminar usuario por ID. Un admin no puede eliminarse a sí mismo | `200`, `400`, `401`, `403`, `404` |

---

### 🎮 Servicios (Sprint 2)
| Método | Ruta | Rol Requerido | Descripción | Códigos HTTP |
|:------:|:-----|:-------------:|:------------|:------------:|
| `POST` | `/api/servicios` | `administrador` | Crear un nuevo servicio de Gaming Arena | `201`, `400`, `401`, `403`, `409` |
| `GET` | `/api/servicios` | Autenticado | Listar servicios. Clientes solo ven `activo: true`; Admins ven todos | `200`, `400`, `401` |
| `GET` | `/api/servicios/:id` | Autenticado | Detalle de un servicio por ID (404 para cliente si está inactivo) | `200`, `400`, `401`, `404` |
| `DELETE` | `/api/servicios/:id` | `administrador` | Eliminar servicio por ID de la plataforma | `200`, `400`, `401`, `403`, `404` |

---

## 🛡️ Mejoras de Seguridad Implementadas en Sprint 2

1. **Corrección del Validador de Rol (`requireRole`):**
   - El token JWT emitido en el login guarda los atributos `{ id, nombre, correo, rol }`.
   - Se corrigió el middleware en [middlewares/auth.js](file:///middlewares/auth.js) para inspeccionar `req.user.rol` en lugar del campo indefinido `req.user.role`, restaurando el acceso legítimo a roles como `administrador`.
2. **Prevención de Escalada de Privilegios en el Registro:**
   - Anteriormente, el endpoint `POST /api/usuarios` permitía enviar `"rol": "administrador"` desde el cuerpo de la petición sin autenticación previa.
   - Se incorporó el middleware `authOpcional`. Si la petición no proviene de un usuario con sesión activa de `administrador`, el backend fuerza de manera obligatoria el rol `"cliente"`. De este modo, el registro público sigue funcionando de forma abierta y segura.
3. **Protección de Datos Sensibles:**
   - Ninguna respuesta expone la contraseña (hash bcrypt) ni el campo interno de versión de Mongoose (`__v`).
4. **Protección contra Autoeliminación de Administradores:**
   - En `DELETE /api/usuarios/:id`, si el administrador en sesión intenta eliminarse a sí mismo (`req.user.id === req.params.id`), la operación es rechazada con código `400`.
5. **Mitigación ReDoS en Búsquedas:**
   - Toda búsqueda por texto libre mediante parámetro `q` pasa por un escapado estricto de caracteres especiales antes de construir la expresión regular de MongoDB.

---

## 🧪 Pruebas Manuales con VS Code REST Client

Se incluye una suite completa de pruebas en el archivo [gaming-arena.http](file:///gaming-arena.http). Puedes ejecutar cada solicitud directamente en Visual Studio Code mediante la extensión **REST Client**, probando:
- Registro normal y prevención de escalada de rol.
- Login y almacenamiento automático de token JWT en variables de entorno de la petición.
- Acceso a endpoints con permisos suficientes (`200`) e insuficientes (`403`).
- Validación de parámetros y formatos ObjectId inválidos (`400`).
- Casos de conflicto por duplicado (`409`) y recursos inexistentes (`404`).

---

## 🤝 Gobernanza, Integración y Contribución

Consulta los siguientes documentos para conocer los flujos de colaboración en el equipo:

- 📖 [CONTRIBUTING.md](file:///CONTRIBUTING.md): Estrategia de ramas (Git Flow), convenciones de commit y flujo de PRs.
- 🔍 [docs/REVISION_PR.md](file:///docs/REVISION_PR.md): Criterios de revisión de código, seguridad y aprobación de Pull Requests.
- 🔀 [docs/RESOLUCION_CONFLICTOS.md](file:///docs/RESOLUCION_CONFLICTOS.md): Guía de resolución de conflictos paso a paso con el caso real de integración de Sprint 2.
