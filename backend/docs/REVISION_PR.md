# Guía de Revisión de Pull Requests (Code Review) - Gaming Arena

Esta guía establece el estándar de revisión de código para todo Pull Request (PR) destinado a las ramas `develop` o `main` del backend de **Gaming Arena**.

---

## 1. Pilares de Revisión

Todo revisor debe contrastar el PR contra los siguientes cinco pilares antes de emitir su voto:

### A. Funcionalidad
- ¿El cambio satisface completamente los criterios de aceptación de la HUS o issue asociado?
- ¿Se documentó cómo probar el cambio en la descripción del PR?
- ¿Se manejan adecuadamente los casos límite? (Ej: límites de paginación superados, registros inexistentes, búsquedas vacías).

### B. Seguridad y Control de Acceso
- **Protección de datos sensibles:** Ninguna respuesta expone contraseñas (ni texto plano ni hash bcrypt) ni metadatos de Mongoose (`__v`).
- **Verificación de roles:** Las operaciones restringidas a administradores deben invocar `requireAuth` y `requireRole("administrador")`. Comprobar que se lea `req.user.rol` y no `req.user.role`.
- **Prevención de escalada de privilegios:** En peticiones públicas (como `POST /api/usuarios`), verificar que ningún usuario externo pueda enviarse el rol `"administrador"`. Solo usuarios con sesión de administrador activa pueden asignar dicho rol.
- **Validación de IDs de base de datos:** Todos los parámetros `:id` deben estar validados con `isMongoId()` para prevenir errores de casteo o manipulaciones maliciosas.
- **Sanitización de búsquedas:** Expresiones regulares creadas a partir de entradas de usuario (`req.query.q`) deben escapar caracteres especiales de regex para evitar ataques ReDoS (Denegación de Servicio por Expresiones Regulares).

### C. Validaciones y Manejo de Errores
- Las validaciones residen en la capa `validators/` usando `express-validator`.
- Errores de validación responden con estado HTTP **400** y el formato unificado:
  ```json
  {
    "mensaje": "Error de validación",
    "errores": [
      { "campo": "nombre", "mensaje": "El nombre es obligatorio" }
    ]
  }
  ```
- Los controladores capturan errores mediante `try/catch` y los propagan con `next(error)` al `errorHandler` centralizado (`middlewares/errorHandler.js`).

### D. Estilo y Convenciones del Proyecto
- **Idioma:** Todo el código (comentarios, mensajes al usuario, nombres de variables) debe estar en **español**.
- **Módulos:** CommonJS (`require` / `module.exports`).
- **Formato de respuesta de éxito:** Siempre responder `{ mensaje, <recurso> }` (ejemplo: `{ mensaje, usuario }`, `{ mensaje, servicio }`, o con paginación `{ mensaje, servicios, total, pagina, totalPaginas }`).
- **Limpieza:** Sin bloques de código comentado obsoleto ni `console.log` de depuración innecesarios.

### E. No Regresión del Sprint 1
- `POST /api/auth/login` (HUS-01) debe responder idéntico.
- `POST /api/usuarios` (HUS-02) debe seguir permitiendo el registro público de clientes sin requerir token previo.
- `GET /api/dashboard` (HUS-03) debe mantener su contrato de autenticación y respuesta.
- `GET /health` debe responder con estado `"ok"`.

---

## 2. Cómo Comentar en una Revisión

Para que las revisiones sean constructivas y ágiles, utiliza etiquetas claras al inicio del comentario (basadas en *Conventional Comments*):

- **`suggestion:`** Sugerencia de mejora opcional o alternativa estilística.
  > *Ejemplo:* `suggestion: podrías usar Math.min(limit, 100) para asegurar el tope de límite en una sola línea legible.`
- **`issue:`** Problema que debe corregirse obligatoriamente antes de poder aprobar el PR.
  > *Ejemplo:* `issue: El endpoint DELETE /api/usuarios/:id permite que un administrador se borre a sí mismo. Debe rechazarse con 400.`
- **`question:`** Pregunta para aclarar la intención de diseño del autor.
  > *Ejemplo:* `question: ¿Por qué en la búsqueda por servicio filtramos solo por nombre y no por categoría también?`
- **`nit:`** Detalle menor (tipografía, espacios, nombre de variable). No bloquea la aprobación.
  > *Ejemplo:* `nit: Corrige la tilde en el mensaje de error: 'categoría'.`

---

## 3. Criterios de Aprobación para Merge

Para poder realizar el merge a `develop` o `main`, un PR debe cumplir con los siguientes requisitos:

1. **Aprobación de al menos un revisor** calificado (según `.github/CODEOWNERS`).
2. **Flujo de Integración Continua (CI) en verde:** El workflow de GitHub Actions (`CI - Verificación Continua`) debe finalizar con éxito (`npm run check` y `npm test`).
3. **Todas las conversaciones resueltas:** Ningún comentario marcado como `issue` debe quedar pendiente.
4. **Rama actualizada:** La rama debe estar al día con la rama destino mediante `git rebase` limpio sin conflictos.
5. **Estrategia de Merge recomendada:** *Squash and merge* o *Merge commit* preservando mensajes explicativos con Conventional Commits.
