# Sprint 3 - Validación y fallo controlado

## Validación inicial

Se creó una configuración mínima de CI con:

- `.github/workflows/ci.yml`
- `package.json`
- `tests/ci-check.test.js`

La validación local se ejecutó con `npm test` y pasó correctamente.

## Fallo controlado reproduciendo error

Se creó una rama aislada `fix/error-actions` y se forzó un fallo en la prueba de `prueba-conflicto.txt`.

Resultado verificado:

- 1 prueba fallida
- mensaje de error real del `AssertionError`
- ejecución con exit code 1

## Recuperación

Se restauró la expectativa correcta y la prueba volvió a pasar con 2 validaciones correctas y 0 fallidas.

Nota: GitHub Actions no se ejecutó desde esta máquina porque no hay autenticación de GitHub ni acceso a GitHub CLI (`gh`) instalado.
