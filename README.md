# TP8-Contenedores-Automatizacion-

Aplicación To-Do completa con frontend, backend y base de datos, con pipeline CI/CD automatizado usando GitHub Actions.

## 📋 Documentación

- **[TEST_CASES.md](./TEST_CASES.md)**: Documentación completa de todos los test cases (unitarios e integración)
- **[E2E_TESTS.md](./E2E_TESTS.md)**: Guía de tests end-to-end con Cypress
- **[SONARQUBE.md](./SONARQUBE.md)**: Configuración de SonarQube/SonarCloud para análisis de código
- **[.github/workflows/README.md](./.github/workflows/README.md)**: Documentación del flujo CI/CD y GitHub Actions

## 🚀 Características

- ✅ Frontend (HTML/CSS/JavaScript)
- ✅ Backend (Node.js)
- ✅ Base de datos (JSON file-based)
- ✅ Tests unitarios (50+ tests)
- ✅ Tests de integración (7 tests)
- ✅ Tests end-to-end con Cypress (8 tests)
- ✅ Análisis de código con SonarQube/SonarCloud
- ✅ CI/CD automatizado con GitHub Actions
- ✅ Deploy automático a QA
- ✅ Aprobación manual para PROD
- ✅ Reportes de tests visibles

## 🧪 Tests

### Ejecutar tests localmente

**Backend:**
```bash
cd backend
npm test
```

**Frontend:**
```bash
cd frontend
npm test
```

**E2E (Cypress):**
```bash
# Desde la raíz del proyecto
# Asegúrate de tener los servidores corriendo primero
npm run test:e2e
```

### En CI/CD

Los tests se ejecutan automáticamente:
- **Tests unitarios**: En cada PR y push a main
- **Tests E2E (Cypress)**: En cada PR y push a main
- **Tests de integración**: Después del deploy a QA
- **Análisis SonarQube**: En cada Pull Request

Ver [TEST_CASES.md](./TEST_CASES.md) para la lista completa de tests.
Ver [E2E_TESTS.md](./E2E_TESTS.md) para los tests end-to-end.

## 🔄 Flujo CI/CD

1. **PR abierto** → CI ejecuta tests unitarios + E2E + SonarQube
2. **PR mergeado** → CI ejecuta build + tests + Docker
3. **CI exitoso** → Deploy automático a QA
4. **Tests de integración** → Validación en QA
5. **Aprobación manual** → Deploy a PROD

Ver [.github/workflows/README.md](./.github/workflows/README.md) para detalles completos.

## 📊 Reportes de Tests

Los reportes de tests están disponibles en:
- **Tests unitarios**: GitHub Actions → Pestaña "Summary" (Step Summary)
- **Tests E2E**: Videos y screenshots disponibles en artifacts (cypress-videos, cypress-screenshots)
- **Análisis de código**: SonarCloud dashboard y comentarios en PRs
- **Logs**: Disponibles en la pestaña "Actions" de GitHub
- **Status checks**: Visibles en Pull Requests

## ✅ Validación de Fallos

- **Tests unitarios fallan** → Pipeline se detiene, no se ejecuta deploy
- **Tests E2E fallan** → Pipeline se detiene, no se ejecuta deploy
- **Tests de integración fallan** → Pipeline se detiene, no se ejecuta deploy a PROD
- **Configuración**: `continue-on-error: false` en todos los jobs de tests

## 📚 Documentación Adicional

- **[TEST_CASES.md](./TEST_CASES.md)**: Lista completa de todos los test cases
- **[E2E_TESTS.md](./E2E_TESTS.md)**: Guía de tests end-to-end con Cypress
- **[SONARQUBE.md](./SONARQUBE.md)**: Configuración de SonarQube/SonarCloud
- **[SETUP.md](./SETUP.md)**: Guía de configuración inicial
- **[RESUMEN_IMPLEMENTACION.md](./RESUMEN_IMPLEMENTACION.md)**: Resumen ejecutivo completo.