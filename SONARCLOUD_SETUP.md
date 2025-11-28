# Configuración de SonarCloud - Guía Completa

## ⚠️ Error: "Could not find a default branch for project"

Este error significa que SonarCloud no puede encontrar el proyecto. Sigue estos pasos para resolverlo.

## 📋 Pasos para Configurar SonarCloud

### 1. Crear Proyecto en SonarCloud

1. Ve a https://sonarcloud.io
2. Inicia sesión con tu cuenta de GitHub
3. Haz click en **"+" → "Analyze new project"**
4. Selecciona **"From GitHub"**
5. Selecciona tu organización (aguslopez9)
6. Selecciona el repositorio: `TP8-Contenedores-Automatizacion-`
7. SonarCloud generará automáticamente:
   - **Organization Key**: `aguslopez9`
   - **Project Key**: `aguslopez9_TP8-Contenedores-Automatizacion-` (o similar)

### 2. Verificar el Project Key

Después de crear el proyecto, SonarCloud te mostrará el **Project Key exacto**. 

**IMPORTANTE**: El Project Key puede tener un formato diferente al que tienes configurado.

#### Formato común:
- `organization_key-project_key`
- Ejemplo: `aguslopez9_TP8-Contenedores-Automatizacion-`

#### Verificar en SonarCloud:
1. Ve a tu proyecto en SonarCloud
2. **Project Settings → General**
3. Copia el **Project Key** exacto

### 3. Actualizar sonar-project.properties

Actualiza el archivo con el Project Key exacto que SonarCloud te dio:

```properties
sonar.projectKey=aguslopez9_TP8-Contenedores-Automatizacion-
sonar.organization=aguslopez9
```

**Nota**: El Project Key puede tener un guión al final o formato diferente. Usa exactamente el que SonarCloud te muestra.

### 4. Configurar GitHub Secret

1. Ve a GitHub → **Settings → Secrets and variables → Actions**
2. Haz click en **"New repository secret"**
3. Nombre: `SONAR_TOKEN`
4. Valor: Obtén el token desde SonarCloud:
   - Ve a SonarCloud
   - **My Account → Security → Generate Token**
   - Copia el token generado
   - Pégalo en el secret de GitHub

### 5. Verificar Vinculación con GitHub

1. En SonarCloud, ve a **Project Settings → General**
2. Verifica que el repositorio de GitHub esté vinculado
3. Si no está vinculado:
   - Ve a **Administration → Projects → Manage**
   - Haz click en tu proyecto
   - Verifica la vinculación con GitHub

## 🔍 Troubleshooting

### Error: "Project key not found"

**Solución:**
1. Verifica que el proyecto exista en SonarCloud
2. Verifica que el `sonar.projectKey` coincida exactamente
3. Verifica que el `sonar.organization` sea correcto

### Error: "SONAR_TOKEN not found"

**Solución:**
1. Verifica que el secret esté en **Repository secrets** (no en environment)
2. Verifica que el nombre sea exactamente `SONAR_TOKEN`
3. Verifica que el token sea válido en SonarCloud

### Error: "Could not find a default branch"

**Solución:**
1. Asegúrate de que el proyecto esté creado en SonarCloud
2. Verifica que el repositorio esté vinculado
3. Verifica que el Project Key sea correcto

## ✅ Verificación

Después de configurar todo:

1. Haz un push a `main` o crea un Pull Request
2. El workflow debería ejecutar el análisis de SonarQube
3. Verifica los logs en GitHub Actions
4. Ve a SonarCloud para ver los resultados

## 📊 Ver Resultados

1. Ve a https://sonarcloud.io
2. Selecciona tu proyecto
3. Verás:
   - Análisis de calidad de código
   - Cobertura de tests
   - Bugs y vulnerabilidades
   - Code smells

## 🔗 Enlaces Útiles

- SonarCloud: https://sonarcloud.io
- Documentación: https://docs.sonarcloud.io
- GitHub Integration: https://docs.sonarcloud.io/integrations/github/

