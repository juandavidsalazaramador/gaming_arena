# Registro de evidencias

| ID | Sprint | Actividad | Evidencia | Archivo o enlace | Estado |
| --- | --- | --- | --- | --- | --- |
| E-01 | Sprint 2 | Rama de trabajo y commits | `git branch -avv` y `git log --oneline --decorate --graph --all` muestran rama `feature/conflicto-prueba` con commit inicial `0f64704`, rama secundaria `feature/conflicto-prueba-qa` y resolución final `bd5669a` | `git log` local | Verificada |
| E-02 | Sprint 2 | Conflicto antes de resolver | El merge de `feature/conflicto-prueba-qa` hacia `feature/conflicto-prueba` generó conflicto en `prueba-conflicto.txt` con marcadores `<<<<<<<` y `>>>>>>>` | [../prueba-conflicto.txt](../prueba-conflicto.txt) | Realizada |
| E-03 | Sprint 2 | Conflicto resuelto | Se eliminan las marcas de conflicto y se mantiene una sola versión final: `Estado: conflicto resuelto y documentado` | [../prueba-conflicto.txt](../prueba-conflicto.txt) | Realizada |
| E-04 | Sprint 2 | Estado limpio después de la resolución | `git status` quedó limpio tras el commit de resolución | `git status` local | Realizada |
| E-05 | Sprint 2 | Evidencias de cambios ya integrados anteriormente | La rama `develop` y `backend` existen en el historial local, con PRs de backend y DevOps visibles en `git log` | `git log --all` | Verificada |
| E-06 | Sprint 3 | Workflow de GitHub Actions | Se creó una validación mínima en `.github/workflows/ci.yml` que dispara en `push` y `pull_request` | [.github/workflows/ci.yml](../.github/workflows/ci.yml) | Realizada |
| E-07 | Sprint 3 | Prueba automatizada | Se añadió `package.json` con script `npm test` y una prueba real usando Node Test Runner | [../package.json](../package.json), [../tests/ci-check.test.js](../tests/ci-check.test.js) | Realizada |
| E-08 | Sprint 3 | Ejecución fallida real | Se forzó una prueba incorrecta en rama `fix/error-actions` y la ejecución falló con 1 test fallido | `npm test` local | Verificada |
| E-09 | Sprint 3 | Corrección realizada | Se restauró la expectativa correcta y se validó la recuperación | [../tests/ci-check.test.js](../tests/ci-check.test.js) | Realizada |
| E-10 | Sprint 3 | Ejecución exitosa posterior | `npm test` devuelve 2 pruebas correctas y 0 fallidas | `npm test` local | Verificada |
| E-11 | Sprint 3 | Issue del error | No hay acceso autenticado a GitHub ni GH CLI en esta sesión; no se pudo crear la Issue remotely | pendiente manual | Pendiente |
| E-12 | Sprint 3 | Pull Request y revisión | No hay permisos para crear PR en GitHub desde esta sesión | pendiente manual | Pendiente |
| E-13 | Sprint 3 | Integración final | La validación quedó verificada localmente; la integración en remoto requiere aprobación de GitHub | pendiente manual | Pendiente |

## Capturas recomendadas

- sprint2-conflicto-antes.png
- sprint2-conflicto-resuelto.png
- sprint3-actions-fallo.png
- sprint3-actions-exitoso.png
- sprint3-issue-error-ci.png
- sprint3-pull-request.png

Estas capturas deben tomarse manualmente si se desea documentar visualmente el resultado en GitHub o en la presentación del taller.
