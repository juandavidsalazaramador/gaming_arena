# Arquitectura de Gaming Arena

Este documento describe cómo está organizado el frontend y el backend de Gaming
Arena y cómo se comunican. Está basado en el código del repositorio; por eso
distingue las funciones que están conectadas actualmente de las que solo tienen
archivos preparados.

## 1. Vista general

Gaming Arena es una aplicación web con un frontend estático y una API REST:

```text
Navegador (HTML + CSS + JavaScript)
        │ solicitudes HTTP / JSON con autenticación
        ▼
API Express (backend/)
        │ modelos Mongoose
        ▼
MongoDB
```

- El **frontend** está en `frontend/`. No usa un framework ni un proceso de
  compilación: las páginas cargan directamente archivos HTML, CSS y JavaScript.
- El **backend** está en `backend/` y usa Node.js, Express y Mongoose.
- La URL predeterminada de la API es `http://localhost:4000/api`, configurable
  en `frontend/js/config.js`.
- El backend no sirve las páginas del frontend. Este se abre desde un servidor
  estático o local independiente; la carpeta `uploads/`, si existe, sí se
  publica desde Express bajo `/uploads`.

## 2. Backend

### Inicio y configuración

- [`backend/server.js`](./backend/server.js) carga las variables de entorno,
  conecta con MongoDB mediante `config/db.js` y después inicia Express en el
  puerto indicado por `PORT` (4000 por defecto). Si falla la conexión o el
  puerto está ocupado, informa el error y termina el proceso.
- [`backend/app.js`](./backend/app.js) configura la aplicación Express:
  habilita CORS, lectura de JSON y formularios, registro de solicitudes con
  Morgan, publicación de `/uploads`, montaje de rutas bajo `/api`, health check
  en `/health` y los middlewares finales de 404 y errores.
- [`backend/config/db.js`](./backend/config/db.js) centraliza la conexión y
  desconexión de Mongoose. Requiere que `MONGODB_URI` esté definida.

### Rutas y controladores

[`backend/routes/index.js`](./backend/routes/index.js) agrupa las rutas activas.
Cada archivo de rutas conecta un método HTTP y una URL con validadores,
middleware y un controlador:

| Ruta activa | Función |
|---|---|
| `POST /api/auth/login` | Valida credenciales y entrega un JWT. |
| `POST /api/usuarios` | Registra una cuenta; el registro público siempre asigna el rol `cliente`. |
| `GET /api/dashboard` | Devuelve un mensaje y el perfil resumido del usuario autenticado. |
| `POST /api/reservations` | Crea una reserva. |
| `GET /api/reservations` | Lista las reservas del usuario autenticado, con filtros y paginación. |
| `GET /api/reservations/:id` | Obtiene una reserva propia. |
| `PUT /api/reservations/:id` | Actualiza una reserva confirmada propia. |
| `PATCH /api/reservations/:id/cancel` | Cancela una reserva confirmada propia. |
| `GET /health` | Devuelve estado, tiempo activo y fecha del servidor; no está bajo `/api`. |

Los controladores de [`backend/controllers/`](./backend/controllers/) contienen
la lógica de cada recurso:

- `auth.controlador.js` busca la cuenta por correo, compara la contraseña con
  bcrypt y firma el JWT.
- `usuario.controlador.js` crea usuarios y nunca devuelve la contraseña. Si no
  hay un administrador autenticado, fuerza el rol de cliente.
- `dashboard.controlador.js` responde con el nombre, correo y rol incluidos en
  el JWT.
- `reserva.controlador.js` comprueba fechas, disponibilidad, propiedad y
  estado; obtiene nombre y precio de la estación desde el catálogo del
  servidor, y calcula el total.
- `servicio.controlador.js` contiene operaciones para crear, listar, consultar
  y eliminar servicios, con paginación y filtros. **Actualmente no está
  conectado a la API:** `routes/index.js` no monta `servicio.routes.js`, por lo
  que las URLs `/api/servicios` responden 404. El archivo de rutas y el modelo
  existen, pero no son una funcionalidad expuesta en la aplicación actual.

### Autenticación, permisos y validación

- [`backend/middlewares/auth.js`](./backend/middlewares/auth.js) verifica
  tokens JWT enviados en el encabezado de autorización con el esquema Bearer.
  `requireAuth` exige una sesión, `authOpcional` permite peticiones públicas y
  `requireRole` limita operaciones a los roles indicados.
- Los validadores de [`backend/validators/`](./backend/validators/) comprueban
  formato y contenido de usuarios, reservas y servicios antes de ejecutar el
  controlador.
- [`backend/middlewares/validarCampos.js`](./backend/middlewares/validarCampos.js)
  reúne los errores de `express-validator` y responde con estado 400.
- [`backend/middlewares/errorHandler.js`](./backend/middlewares/errorHandler.js)
  convierte errores comunes de Mongoose, IDs, duplicados y JWT en respuestas
  HTTP; también responde para rutas inexistentes.

Las rutas de reservas aplican autenticación a todo el recurso. Los
controladores consultan y modifican reservas usando el ID del usuario del token,
de modo que una sesión solo opera sobre sus propias reservas.

### Datos y reglas de reservas

Los modelos Mongoose se encuentran en [`backend/models/`](./backend/models/):

- `Usuario.js` define nombre, GamerTag, correo, contraseña y rol. La contraseña
  se cifra con bcrypt antes de guardarse y se excluye por defecto de las
  consultas.
- `Reserva.js` guarda propietario, estación, fecha, hora, duración, precio,
  observaciones, estado y bloques horarios. Tiene timestamps e índices para
  consultas y para impedir que se confirmen reservas superpuestas.
- `Servicio.js` define nombre, descripción, categoría, precio, duración y
  estado activo. Pertenece al módulo de servicios que aún no está montado en
  las rutas principales.

[`backend/config/estaciones.js`](./backend/config/estaciones.js) es el catálogo
de referencia del servidor: contiene los IDs, nombres y precios por hora de las
seis estaciones. El cliente no decide el precio final; el backend lo calcula
con este catálogo.

[`backend/utils/reservas.js`](./backend/utils/reservas.js) genera una clave por
cada hora reservada y formatea la respuesta para que el frontend consuma
propiedades como `stationId`, `stationName`, `time`, `durationHours`,
`totalPrice` y `status`. Las claves únicas en MongoDB también protegen contra
dos solicitudes concurrentes para el mismo bloque.

El validador de reservas restringe las estaciones al catálogo, requiere fecha
válida, limita la duración de 1 a 4 horas, acepta observaciones de hasta 500
caracteres y define las franjas de inicio admitidas (14:00, 16:00, 18:00,
20:00 y 22:00). Las reservas solo pueden editarse o cancelarse cuando están
confirmadas.

### Pruebas y comandos

El backend define estos scripts en [`backend/package.json`](./backend/package.json):

- `npm run dev`: inicia el servidor con Nodemon.
- `npm start`: inicia el servidor normalmente.
- `npm run check`: revisa la sintaxis de JavaScript y que la aplicación Express
  se pueda cargar.
- `npm test`: ejecuta las pruebas con el test runner integrado de Node.js. Las
  pruebas actuales cubren validaciones, reglas de horario, registro y
  autenticación.

## 3. Frontend

### Páginas

- [`frontend/index.html`](./frontend/index.html) redirige a la página de inicio
  de sesión.
- [`frontend/login.html`](./frontend/login.html) muestra el formulario de
  acceso, validaciones visibles y enlaces a registro. La recuperación de
  contraseña y el acceso con Steam o Discord son avisos de funciones futuras,
  no integraciones activas.
- [`frontend/register.html`](./frontend/register.html) contiene el formulario
  de alta, confirmación y medidor visual de fortaleza de contraseña, y
  aceptación del código de conducta.
- [`frontend/dashboard.html`](./frontend/dashboard.html) estructura la
  navegación, perfil, métricas, catálogo de estaciones, filtros e historial de
  reservas. También define el modal para crear y editar una reserva.

### JavaScript del navegador

- [`frontend/js/config.js`](./frontend/js/config.js) concentra la URL de la API,
  el cliente HTTP `APIClient`, la gestión de sesión `AuthManager`, los toast y
  el catálogo visual inicial de estaciones. `APIClient` serializa los cuerpos
  JSON, adjunta el token almacenado y traduce respuestas de error a mensajes.
  Ante un 401 borra la sesión y, desde el dashboard, redirige al login.
- [`frontend/js/auth.js`](./frontend/js/auth.js) conecta los formularios de
  login y registro. Valida campos en el navegador, envía los datos a la API,
  convierte el usuario de respuesta al formato que usa la interfaz y guarda
  token y perfil en `localStorage`. Al registrarse, primero crea la cuenta y
  luego intenta iniciar sesión automáticamente.
- [`frontend/js/dashboard.js`](./frontend/js/dashboard.js) requiere una sesión
  local, pinta el perfil y las estaciones, administra los filtros y la tabla de
  reservas, y conecta las acciones de detalle, crear, editar, cancelar y
  paginar con los endpoints de reservas. El resumen de reservas activas procede
  de la API.

La sesión del navegador se guarda con las claves `gaming_arena_token` y
`gaming_arena_user`. El frontend redirige a login si no encuentra esos datos,
pero la autorización real se valida en el backend para cada endpoint protegido.

### Estilos

- [`frontend/css/main.css`](./frontend/css/main.css) define los estilos
  globales, variables de color y tipografía, fondos, botones, formularios y
  componentes compartidos.
- [`frontend/css/auth.css`](./frontend/css/auth.css) diseña las pantallas de
  inicio de sesión y registro, incluida su adaptación a pantallas más pequeñas.
- [`frontend/css/dashboard.css`](./frontend/css/dashboard.css) da estilo a la
  navegación, catálogo, métricas, tablas y modal del panel.

El diseño usa una paleta oscura con acentos neón y reglas CSS responsivas. Las
fuentes Outfit y Rajdhani se solicitan a Google Fonts.

### Datos visibles que todavía no vienen del backend

El catálogo de estaciones se define por separado en `frontend/js/config.js` y
`backend/config/estaciones.js`; sus IDs, nombres y precios deben mantenerse
coordinados. El catálogo que se ve en pantalla y los estados visuales de las
estaciones proceden del frontend, no de una consulta a la API.

El saldo de Coins y las horas jugadas no están disponibles en los modelos ni
endpoints actuales, por eso la interfaz muestra un guion. El nivel/rango y
algunos textos de perfil son datos visuales predeterminados. La tarjeta
“Próxima sesión” se obtiene en el navegador de la primera reserva confirmada
cargada (y tiene un valor inicial de presentación en el HTML); no es un dato
calculado por el backend. La API de dashboard existe, pero el script del panel
actual usa el perfil guardado tras el login y no solicita
`GET /api/dashboard`.

## 4. Flujo completo de una reserva

1. El usuario inicia sesión desde `login.html`; `auth.js` envía correo y
   contraseña a `POST /api/auth/login`.
2. El backend compara la contraseña cifrada, devuelve un JWT y los datos
   públicos del usuario. El navegador guarda ambos en `localStorage`.
3. En el dashboard, el usuario selecciona estación, fecha, hora, duración y
   observaciones. `dashboard.js` muestra una estimación del precio con el
   catálogo visual.
4. `APIClient` envía esos datos a `POST /api/reservations` y adjunta el JWT.
5. El backend valida la solicitud, obtiene precio y nombre de su propio
   catálogo, comprueba los bloques horarios y guarda la reserva en MongoDB.
6. La respuesta se formatea con el contrato esperado por el frontend; el panel
   vuelve a cargar la lista y muestra una notificación.

Para editar y cancelar se usan, respectivamente, `PUT
/api/reservations/:id` y `PATCH /api/reservations/:id/cancel`; el backend vuelve
a validar propiedad, estado y disponibilidad.

## 5. Límites actuales de la implementación

- El frontend no se sirve desde Express; frontend y backend se ejecutan por
  separado.
- Los módulos de servicios están escritos pero la ruta no está montada en
  `backend/routes/index.js`.
- En usuarios solo está conectada la ruta de registro (`POST /api/usuarios`);
  no hay rutas de listado, detalle ni eliminación en el índice/controlador
  actual.
- El tablero de reservas se integra con la API; el catálogo de estaciones y
  algunos datos del perfil continúan siendo locales o de demostración.
- Los textos promocionales de Coins, rango, torneos y proveedores externos no
  implican que esas funciones estén implementadas en el backend.
