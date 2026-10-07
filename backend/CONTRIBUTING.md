# Guía de Contribución - Gaming Arena API Backend

Bienvenido al proyecto **Gaming Arena - API Backend**. Esta guía describe las normas de trabajo en equipo, la estrategia de ramificación, la convención de commits y el flujo de integración continua que debemos seguir para mantener el repositorio ordenado, seguro y con alta calidad de código.

---

## 1. Estrategia de Ramas (Git Flow)

El repositorio utiliza una adaptación de Git Flow organizada en las siguientes ramas:

| Rama | Propósito | Rama Origen | Rama Destino |
|------|-----------|-------------|--------------|
| `main` | Producción / Versión estable y desplegable. Solo recibe merges aprobados desde `develop` o `hotfix/*`. | - | - |
| `develop` | Integración continua. Contiene los avances consolidados del Sprint en curso. | `main` | `main` |
| `feature/*` | Desarrollo de nuevas características o funcionalidades del sprint. | `develop` | `develop` |
| `fix/*` | Corrección de errores detectados en desarrollo o staging. | `develop` | `develop` |
| `hotfix/*` | Correcciones críticas urgentes sobre código productivo. | `main` | `main` y `develop` |

### Ejemplos de ramas de trabajo:
- `feature/usuarios-crd`: Implementación del CRD de usuarios, paginación y filtros.
- `feature/servicios-crd`: Implementación del modelo y endpoints CRD para servicios de Gaming Arena.
- `fix/auth-rol-token`: Corrección de lectura de roles en el middleware de autenticación.

---

## 2. Convención de Commits (Conventional Commits)

Cada commit debe ser **atómico** (hacer una sola cosa bien) y seguir el formato estándar:

```text
<tipo>(<alcance opcional>): <descripción imperativa en minúsculas>
```

### Tipos de commit admitidos:
- **`feat:`** Una nueva funcionalidad para el usuario o la API.
  - *Ejemplo:* `feat(usuarios): implementar listado con paginacion y busqueda regex`
  - *Ejemplo:* `feat(servicios): crear modelo y endpoints CRD de servicios`
- **`fix:`** Corrección de un error o vulnerabilidad.
  - *Ejemplo:* `fix(auth): corregir lectura de req.user.rol en requireRole`
  - *Ejemplo:* `fix(usuarios): forzar rol cliente en registro publico para prevenir escalada`
- **`docs:`** Cambios únicamente en documentación (README, guías, comentarios).
  - *Ejemplo:* `docs: actualizar tabla de endpoints y resolucion de conflictos`
- **`chore:`** Tareas de mantenimiento, configuración de entorno o herramientas.
  - *Ejemplo:* `chore(deps): sincronizar dependencias en package-lock.json`
- **`refactor:`** Modificación de código que no arregla un bug ni añade una feature.
  - *Ejemplo:* `refactor(controlador): modularizar filtros de busqueda en servicios`
- **`ci:`** Cambios en flujos de integración continua o GitHub Actions.
  - *Ejemplo:* `ci: agregar workflow de verificacion automatica con node 20`
- **`test:`** Incorporación o ajuste de pruebas o colecciones de validación.
  - *Ejemplo:* `test: agregar casos de prueba manuales en archivo http para sprint 2`

---

## 3. Flujo de Trabajo Paso a Paso

1. **Sincronizar la rama base:**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Crear una rama de trabajo:**
   ```bash
   git checkout -b feature/nombre-de-la-funcionalidad
   ```

3. **Desarrollar y realizar commits atómicos:**
   ```bash
   git add <archivos-modificados>
   git commit -m "feat(alcance): descripcion breve del cambio"
   ```

4. **Sincronizar mediante Rebase con `develop` antes de abrir PR:**
   ```bash
   git fetch origin
   git rebase origin/develop
   ```
   *Si surgen conflictos, resolverlos archivo por archivo, ejecutar `git add <archivo>` y continuar con `git rebase --continue` (consultar [docs/RESOLUCION_CONFLICTOS.md](docs/RESOLUCION_CONFLICTOS.md)).*

5. **Validar la calidad localmente:**
   ```bash
   npm run check
   npm test
   ```

6. **Publicar la rama y abrir Pull Request:**
   ```bash
   git push origin feature/nombre-de-la-funcionalidad
   ```
   Completar todos los campos de la plantilla `.github/pull_request_template.md`.

---

## 4. Estándares y Convenciones del Código

1. **Idioma:** Todo el código, variables descriptivas, mensajes de error, comentarios y commits se redactan en **español**.
2. **Arquitectura por capas:**
   - `routes/` $\rightarrow$ define endpoints y asigna middlewares.
   - `validators/` $\rightarrow$ reglas declarativas con `express-validator`.
   - `middlewares/validarCampos` $\rightarrow$ formatea errores en 400 `{ mensaje: "Error de validación", errores: [...] }`.
   - `controllers/` $\rightarrow$ lógica de negocio asíncrona con bloque `try/catch` y `next(error)`.
   - `models/` $\rightarrow$ esquemas Mongoose con validaciones y hooks de seguridad.
3. **Seguridad obligatoria:**
   - Nunca exponer `contraseña` ni `__v` en respuestas JSON.
   - Validar parámetros de tipo ID de MongoDB con `isMongoId()`.
   - Requerir token JWT en endpoints protegidos (`requireAuth`) y verificar roles (`requireRole("administrador")`).
   - Evitar escalada de privilegios en peticiones públicas.
