# Guía de Resolución de Conflictos en Git - Gaming Arena Backend

Esta guía proporciona el procedimiento paso a paso para resolver conflictos de integración en el repositorio de **Gaming Arena API Backend**, documentando las mejores prácticas y un **caso real de conflicto** ocurrido durante el Sprint 2.

---

## 1. ¿Por qué Ocurren los Conflictos?

Cuando dos o más desarrolladores trabajan simultáneamente en ramas derivadas de `develop`, es frecuente que modifiquen los mismos archivos o líneas cercanas. Al momento de integrar la segunda rama mediante `rebase` o `merge`, Git no puede decidir automáticamente qué cambio preservar y solicita intervención manual.

---

## 2. Flujo Paso a Paso de Resolución con Rebase

El método recomendado en este equipo es **`git rebase`**, ya que mantiene un historial lineal, limpio y fácil de auditar.

### Paso 1: Actualizar la información remota
```bash
git fetch origin
```

### Paso 2: Posicionarse en la rama de trabajo
```bash
git checkout feature/servicios-crd
```

### Paso 3: Iniciar el rebase sobre la rama de integración actualizada
```bash
git rebase origin/develop
```

### Paso 4: Identificar los archivos en conflicto
Si Git detecta colisiones, detendrá el proceso y mostrará los archivos afectados:
```bash
git status
```
Los archivos problemáticos figurarán bajo la sección `both modified: <archivo>`.

### Paso 5: Abrir y resolver los delimitadores de conflicto
Git inserta marcas visuales en el código:
```javascript
<<<<<<< HEAD (cambio proveniente de develop)
código existente en la rama base
=======
código de tu rama de trabajo
>>>>>>> feat(servicios): implementar modelo y endpoints CRD de servicios
```
- Edita el archivo para dejar la combinación correcta de código.
- Elimina todas las líneas de delimitadores (`<<<<<<<`, `=======`, `>>>>>>>`).

### Paso 6: Marcar como resuelto
```bash
git add <archivo-resuelto>
```

### Paso 7: Continuar el rebase
```bash
git rebase --continue
```
*(Si en Windows se abre un editor de texto interactivo no deseado, puedes configurar temporalmente `$env:GIT_EDITOR="true"` en PowerShell antes de continuar).*

> ⚠️ **En caso de emergencia:** Si deseas cancelar el rebase y regresar exactamente al estado previo, ejecuta:
> ```bash
> git rebase --abort
> ```

### Paso 8: Comprobar la integridad del código
Antes de subir la rama, ejecuta las verificaciones locales:
```bash
npm run check
npm test
```

### Paso 9: Publicar los cambios actualizados
Dado que un rebase reescribe el historial de commits de la rama de características, se debe utilizar `--force-with-lease` para no sobreescribir trabajo ajeno en el remoto:
```bash
git push origin feature/servicios-crd --force-with-lease
```

---

## 3. Conflictos Típicos en este Proyecto

### A. Archivo Central de Enrutamiento (`routes/index.js`)
- **Causa:** Cada nueva funcionalidad suele montar un nuevo recurso en el enrutador de Express (`router.use("/...", ...)`).
- **Solución:** Mantener ambos montajes de rutas organizados por recurso, asegurando que todos los archivos requeridos existan y tengan nombres coherentes.

### B. Bloqueo de Dependencias (`package-lock.json`)
- **Causa:** Ambas ramas instalaron o actualizaron librerías.
- **Solución:** **NUNCA** resolver conflictos de `package-lock.json` editando manualmente el archivo JSON. El procedimiento correcto es:
  1. Aceptar la versión de `package.json` deseada.
  2. Regenerar el lockfile ejecutando:
     ```bash
     npm install --package-lock-only
     ```
  3. Agregar el lockfile regenerado:
     ```bash
     git add package-lock.json
     ```
  4. Continuar el rebase con `git rebase --continue`.

---

## 4. Caso Real Documentado: Integración de Sprint 2

Durante el Sprint 2 se desarrollaron en paralelo dos ramas a partir del commit base de `develop`:
1. `feature/usuarios-crd`: Extensión del modelo y endpoints de usuarios con paginación y seguridad.
2. `feature/servicios-crd`: Creación del nuevo recurso Servicios (modelo, controlador, validador y rutas).

### Cronología del Conflicto Real:
1. La rama `feature/usuarios-crd` se integró primero en `develop`.
2. Al estar en la rama `feature/servicios-crd` y ejecutar:
   ```bash
   git rebase develop
   ```
3. Git arrojó la siguiente salida:
   ```text
   Auto-merging routes/index.js
   CONFLICT (content): Merge conflict in routes/index.js
   error: could not apply b552f00... feat(servicios): implementar modelo y endpoints CRD de servicios
   hint: Resolve all conflicts manually, mark them as resolved with
   hint: "git add/rm <conflicted_files>", then run "git rebase --continue".
   ```

### Estado del Archivo `routes/index.js` en el Conflicto:
```javascript
const { Router } = require("express");

const router = Router();

// Montamos las rutas de cada recurso
// Cada archivo define sus propios endpoints
router.use("/usuarios", require("./usuario.routes"));    // CRD /api/usuarios
router.use("/auth", require("./auth.routes"));           // POST /api/auth/login
router.use("/dashboard", require("./dashboard.routes")); // GET /api/dashboard
<<<<<<< HEAD
// Rutas de administración y usuarios (Sprint 2)
=======
router.use("/servicios", require("./servicio.routes")); // CRD /api/servicios
>>>>>>> b552f00 (feat(servicios): implementar modelo y endpoints CRD de servicios)

module.exports = router;
```

### Resolución Aplicada:
Se combinaron ambos recursos en el enrutador general de Express, retirando las marcas de conflicto y preservando el montaje de `/servicios`:

```javascript
const { Router } = require("express");

const router = Router();

// Montamos las rutas de cada recurso
// Cada archivo define sus propios endpoints
router.use("/usuarios", require("./usuario.routes"));    // CRD /api/usuarios
router.use("/auth", require("./auth.routes"));           // POST /api/auth/login
router.use("/dashboard", require("./dashboard.routes")); // GET /api/dashboard
router.use("/servicios", require("./servicio.routes")); // CRD /api/servicios

module.exports = router;
```

### Comandos de Finalización:
```bash
git add routes/index.js
$env:GIT_EDITOR="true"; git rebase --continue
```
Resultado exitoso:
```text
[detached HEAD 084b86c] feat(servicios): implementar modelo y endpoints CRD de servicios
 5 files changed, 311 insertions(+), 1 deletion(-)
Successfully rebased and updated refs/heads/feature/servicios-crd.
```
Posteriormente se validó con `npm run check` y `npm test`, garantizando que ambos recursos coexisten sin romper ningún contrato de la API.
