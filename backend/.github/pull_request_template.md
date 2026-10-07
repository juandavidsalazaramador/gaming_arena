## 📝 Descripción del Cambio

<!-- Explica de forma clara y concisa el propósito del cambio y el problema que soluciona. -->

## 📌 HUS / Issue Relacionado
- Closes / Ref: # <!-- Número de issue o código de historia de usuario (ej. HUS-04, HUS-05) -->

## 🏷️ Tipo de Cambio
- [ ] 🚀 Nueva funcionalidad (`feat`)
- [ ] 🐛 Corrección de bug (`fix`)
- [ ] 📚 Documentación (`docs`)
- [ ] 🔧 Tareas de mantenimiento o configuración (`chore`)
- [ ] ♻️ Refactorización de código (`refactor`)
- [ ] 🧪 Pruebas (`test`)
- [ ] ⚙️ CI / DevOps (`ci`)

---

## 🧪 ¿Cómo Probar los Cambios?
<!-- Describe los pasos manuales o peticiones HTTP necesarias para verificar que la funcionalidad opera correctamente. -->
1. Iniciar el servidor local (`npm run dev`).
2. Enviar la petición correspondiente utilizando el archivo de pruebas `gaming-arena.http` o Postman / Thunder Client.
3. Verificar los códigos de respuesta esperados (200, 201, 400, 401, 403, 404, 409).
4. Comprobar que no se exponen campos sensibles (contraseña, secretos).

---

## ✅ Checklist de Calidad
Antes de solicitar revisión, confirma que cumples con los siguientes puntos:

- [ ] **Probado manualmente:** Se validaron tanto los casos de éxito como los casos de error.
- [ ] **Sin console.log innecesarios:** Se removieron trazas temporales de depuración.
- [ ] **Sin secretos expuestos:** Ninguna clave, contraseña o `.env` se encuentra versionada.
- [ ] **Sintaxis y CI:** Se ejecutó `npm run check` y `npm test` exitosamente en local.
- [ ] **Sincronizado con develop:** La rama tiene rebase actualizado con `origin/develop` sin conflictos.
- [ ] **Documentación actualizada:** Se documentaron los nuevos endpoints en `README.md` si aplica.
- [ ] **Convención de commits:** Los mensajes de commit siguen Conventional Commits.
