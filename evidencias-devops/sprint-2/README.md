# Sprint 2 - Conflicto de Git

- Rama base: `feature/conflicto-prueba`
- Rama de conflicto: `feature/conflicto-prueba-qa`
- Resultado: se provocó un conflicto real y se resolvió con una sola línea final.

## Evidencia local

Se ejecutaron los comandos:

- `git branch -avv`
- `git log --oneline --decorate --graph --all -n 10`
- `git merge feature/conflicto-prueba-qa`
- `git status --short --branch`

La resolución quedó guardada en el commit `bd5669a`.
