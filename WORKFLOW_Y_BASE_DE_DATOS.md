# Flujo de trabajo y base de datos — Gaming Arena

## 1. Flujo de trabajo del equipo

El proyecto utiliza una version de Git Flow sencilla:

```text
main (version estable)
  ^ Pull Request de integracion/version
develop (integracion del sprint)
  ^ Pull Request
frontend / backend (ramas de integracion usadas en el proyecto)
  ^ Pull Request
feature/* o fix/*
```

El flujo de una historia de usuario es:

```text
HUS -> Issue -> tarjeta de GitHub Project -> rama -> desarrollo y pruebas
    -> commit -> push -> Pull Request -> Code Review
    -> GitHub Actions -> merge a la rama de integracion
    -> integracion a develop -> version estable en main
```

`main` representa la version estable, `develop` integra los cambios del sprint,
`frontend` y `backend` se usaron como ramas de integracion, y `feature/*` y
`fix/*` representan trabajo de funcionalidad y correccion. La guia indica que
no se debe hacer push directo a `main`; las integraciones relevantes pasan por
Pull Requests y revision.

GitHub Projects permite visualizar el estado de Issues y PRs como tarjetas. El
equipo usa la vista con estados **Hacer**, **En curso** y **Hecho**. El estado de
la tarjeta debe corresponder al avance comprobado, no solo a que el codigo o el
issue exista.

La guia propone tres sprints con esta rotacion de responsabilidades:

| Sprint | Aprendiz 1 | Aprendiz 2 | Aprendiz 3 |
|---|---|---|---|
| Sprint 1 | Frontend | Backend | Integracion/DevOps |
| Sprint 2 | Backend | Integracion/DevOps | Frontend |
| Sprint 3 | Integracion/DevOps | Frontend | Backend |

Usen los nombres reales del equipo al presentar la tabla. El rol define el
enfoque principal de cada aprendiz; todo el equipo debe conocer y realizar el
flujo de Git/GitHub.

## 2. GitHub Actions / CI

GitHub Actions ejecuta pasos automatizados cuando ocurre un evento en GitHub.
En el workflow siguiente, los eventos son pushes a cualquier rama y Pull
Requests. El job instala dependencias del backend, verifica sintaxis JavaScript
y ejecuta las pruebas configuradas.

### Workflow configurado localmente

El contenido actual de `.github/workflows/ci.yml` en este espacio de trabajo es:

```yaml
name: CI

on:
  push:
    branches:
      - '**'
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: npm ci --prefix backend --no-fund --no-audit

      - name: Check JavaScript syntax
        run: npm run check

      - name: Run tests
        run: npm test
```

Los comandos de nivel raiz se conectan a los del backend:

- `npm run check` ejecuta la verificacion sintactica de JavaScript y carga
  `app.js`.
- `npm test` ejecuta las pruebas configuradas para los modelos y reglas de
  autenticacion/reservas.

**Importante:** este workflow es un cambio local pendiente de commit y push en
el estado actual del espacio de trabajo. No afirmes que esta version ya fue
ejecutada por GitHub Actions. Las ejecuciones remotas consultadas el 3 de
noviembre de 2026 correspondian al 28 de octubre: el workflow `CI` fallo durante
la configuracion de Node.js, y `Gaming Arena CI` quedo verde sin ejecutar
pruebas reales. Despues de integrar el workflow actualizado, hay que abrir
Actions y confirmar que todos los pasos se ejecuten correctamente.

Una luz verde no demuestra por si sola que el codigo fue probado: se deben
revisar los pasos y el log del job.

## 3. Base de datos

### Tecnologia

El proyecto usa **MongoDB**, una base de datos NoSQL orientada a documentos, y
**Mongoose** como ODM (Object Document Mapper) desde Node.js.

La guia del taller propone MongoDB. El backend se conecta usando la variable
`MONGODB_URI`, definida en el archivo local `backend/.env`, mediante
`backend/config/db.js`. Las variables de entorno permiten cambiar la conexion
sin escribir credenciales en el codigo ni subirlas al repositorio.

### Modelos principales

| Modelo / coleccion | Datos principales | Relacion y reglas |
|---|---|---|
| `Usuario` | nombre, gamerTag, correo, contrasena, rol | Correo unico; contrasena con hash bcrypt; roles cliente/administrador. |
| `Servicio` | nombre, descripcion, categoria, precio, duracion y activo | Nombre unico; categoria validada; precio no negativo. |
| `Reserva` | usuario, estacion, fecha, hora, duracion, precio, estado y claves horarias | Referencia al usuario; validacion de duracion/estado; indice unico parcial sobre los bloques de reservas confirmadas para impedir solapamientos. |

Los esquemas y reglas se encuentran en `backend/models/Usuario.js`,
`backend/models/Servicio.js` y `backend/models/Reserva.js`. El controlador de
reservas calcula el precio desde el catalogo del servidor y no confia en el
precio enviado por el navegador.

### Como se implemento

1. El servidor carga configuracion y conecta Mongoose a MongoDB al iniciar.
2. Los esquemas Mongoose definen campos requeridos, tipos, valores permitidos,
   indices y marcas de tiempo.
3. Las rutas reciben solicitudes HTTP; validadores y middleware comprueban
   datos/autenticacion; los controladores ejecutan la logica y leen o escriben
   documentos mediante los modelos.
4. En reservas se guardan bloques horarios y un indice unico para evitar
   confirmar dos reservas que ocupen el mismo bloque.
5. Los datos se separan por colecciones/documentos, y la reserva referencia al
   usuario mediante un `ObjectId`.

### En que sprint y por que

Segun la guia del taller, la **conexion a la base de datos y la autenticacion
inicial** pertenecen al trabajo sugerido de **Sprint 1**, junto con la
estructura inicial de la API. En **Sprint 2** se amplian modelos y operaciones
de usuarios y servicios (HUS-04 y HUS-05). En **Sprint 3** se agregan persistencia
y operaciones de reservas (HUS-06 a HUS-09).

Esta secuencia permite empezar con una base conectada, extenderla con las
entidades principales y luego almacenar las reservas con sus reglas de
disponibilidad. MongoDB fue escogida porque es la tecnologia propuesta por la
guia y Mongoose permite declarar validaciones y modelos desde el backend
JavaScript.

## 4. Como explicarlo oralmente

> "Usamos MongoDB con Mongoose. MongoDB guarda documentos organizados en las
> colecciones de usuarios, servicios y reservas. Mongoose define los modelos,
> tipos, validaciones e indices que aplica el backend. La conexion se configura
> mediante `MONGODB_URI` en el entorno y no se debe publicar esa configuracion
> privada. El trabajo comienza en Sprint 1 con la conexion y estructura; se
> extiende con usuarios y servicios en Sprint 2, y en Sprint 3 se implementa la
> persistencia y las reglas de disponibilidad de las reservas. GitHub Actions
> automatiza las validaciones del codigo cuando se publica un cambio, pero el
> workflow actualizado aun requiere publicarse y comprobarse en GitHub."
