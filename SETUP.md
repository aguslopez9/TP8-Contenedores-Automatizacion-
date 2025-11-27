# Guía de Configuración Inicial

Esta guía te ayudará a configurar el proyecto desde cero.

## Requisitos Previos

- Node.js 20 o superior
- Python 3 (para el servidor del frontend en desarrollo)
- Git
- Cuenta de GitHub

## Instalación Local

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd TP8-Contenedores-Automatizacion-
```

### 2. Instalar dependencias

```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..

# Raíz (para tests E2E)
npm install
```

### 3. Instalar Playwright browsers

```bash
npx playwright install
```

## Ejecutar la Aplicación Localmente

### Terminal 1 - Backend

```bash
cd backend
PORT=3001 npm start
```

### Terminal 2 - Frontend

```bash
cd frontend
python3 -m http.server 8080
```

### Acceder

Abre tu navegador en: http://localhost:8080

## Ejecutar Tests

### Tests Unitarios

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Tests E2E

```bash
# Desde la raíz del proyecto
npm run test:e2e
```

## Configurar SonarCloud

### 1. Crear cuenta en SonarCloud

1. Ve a https://sonarcloud.io
2. Inicia sesión con GitHub
3. Autoriza la aplicación

### 2. Crear proyecto

1. En SonarCloud: **+ → Analyze new project → From GitHub**
2. Selecciona tu repositorio
3. Copia el **Organization Key** y **Project Key**

### 3. Actualizar configuración

Edita `sonar-project.properties`:

```properties
sonar.projectKey=TU_ORGANIZATION_KEY_TU_PROJECT_KEY
sonar.organization=TU_ORGANIZATION_KEY
```

### 4. Configurar secret en GitHub

1. Ve a **Settings → Secrets and variables → Actions**
2. Agrega secret: `SONAR_TOKEN`
   - Obtén el token en SonarCloud: **My Account → Security → Generate Token**

## Configurar GitHub Actions

### Branch Protection Rules

1. **Settings → Branches → Branch protection rules → main**
2. Activa:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Selecciona: `build_frontend`, `build_backend`

### Environments

1. **Settings → Environments**

2. **Environment: `qa`**
   - Sin aprobación requerida
   - Agrega secrets y variables de QA

3. **Environment: `prod`**
   - ✅ Require reviewers (aprobación manual)
   - Agrega secrets y variables de PROD

## Variables y Secrets Requeridos

### QA Environment

**Variables:**
- `QA_BACKEND_URL`
- `QA_FRONTEND_SITE_ID`
- `QA_FRONTEND_DEPLOY_ENDPOINT`
- `QA_BACKEND_SERVICE_ID`
- `QA_RENDER_REGION`
- `QA_HEALTHCHECK_URL` (opcional)

**Secrets:**
- `QA_FRONTEND_TOKEN`
- `QA_BACKEND_TOKEN`

### PROD Environment

**Variables:**
- `PROD_BACKEND_URL`
- `PROD_FRONTEND_SITE_ID`
- `PROD_FRONTEND_DEPLOY_ENDPOINT`
- `PROD_BACKEND_SERVICE_ID`
- `PROD_RENDER_REGION`
- `PROD_HEALTHCHECK_URL` (opcional)

**Secrets:**
- `PROD_FRONTEND_TOKEN`
- `PROD_BACKEND_TOKEN`

### Global

**Secrets:**
- `SONAR_TOKEN` (para análisis de código)

## Verificar que Todo Funciona

1. **Tests unitarios pasan**:
   ```bash
   cd backend && npm test
   cd ../frontend && npm test
   ```

2. **Tests E2E pasan**:
   ```bash
   npm run test:e2e
   ```

3. **CI/CD funciona**:
   - Haz un push a `main`
   - Verifica que el workflow CI se ejecuta
   - Verifica que los tests pasan

## Próximos Pasos

- Revisa [TEST_CASES.md](./TEST_CASES.md) para entender todos los tests
- Revisa [E2E_TESTS.md](./E2E_TESTS.md) para tests E2E
- Revisa [SONARQUBE.md](./SONARQUBE.md) para análisis de código
- Revisa [.github/workflows/README.md](./.github/workflows/README.md) para el flujo CI/CD

