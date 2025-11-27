# TP8-Contenedores-Automatizacion-

Aplicación To-Do completa con frontend, backend y base de datos, con pipeline CI/CD automatizado usando GitHub Actions.

## 📋 Documentación

- **[TEST_CASES.md](./TEST_CASES.md)**: Documentación completa de todos los test cases (unitarios e integración)
- **[.github/workflows/README.md](./.github/workflows/README.md)**: Documentación del flujo CI/CD y GitHub Actions

## 🚀 Características

- ✅ Frontend (HTML/CSS/JavaScript)
- ✅ Backend (Node.js)
- ✅ Base de datos (JSON file-based)
- ✅ Tests unitarios (50+ tests)
- ✅ Tests de integración (7 tests)
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

### En CI/CD

Los tests se ejecutan automáticamente:
- **Tests unitarios**: En cada PR y push a main
- **Tests de integración**: Después del deploy a QA

Ver [TEST_CASES.md](./TEST_CASES.md) para la lista completa de tests.

## 🔄 Flujo CI/CD

1. **PR abierto** → CI ejecuta tests
2. **PR mergeado** → CI ejecuta build + tests + Docker
3. **CI exitoso** → Deploy automático a QA
4. **Tests de integración** → Validación en QA
5. **Aprobación manual** → Deploy a PROD

Ver [.github/workflows/README.md](./.github/workflows/README.md) para detalles completos.

## 📊 Reportes de Tests

Los reportes de tests están disponibles en:
- GitHub Actions → Pestaña "Summary" (Step Summary)
- Logs del workflow en la pestaña "Actions"
- Status checks en Pull Requests

## ✅ Validación de Fallos

- **Tests unitarios fallan** → Pipeline se detiene, no se ejecuta deploy
- **Tests de integración fallan** → Pipeline se detiene, no se ejecuta deploy a PROD
- **Configuración**: `continue-on-error: false` en todos los jobs de tests.