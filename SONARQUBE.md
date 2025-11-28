# Análisis de Código con SonarQube/SonarCloud

Este documento describe la configuración de SonarQube para análisis de calidad de código y cobertura.

## Configuración

### SonarCloud (Cloud - Gratuito)

El proyecto está configurado para usar **SonarCloud** (versión cloud gratuita de SonarQube).

### Archivo de Configuración

`sonar-project.properties` contiene la configuración del análisis.

## Setup Inicial

### 1. Crear cuenta en SonarCloud

1. Ve a https://sonarcloud.io
2. Inicia sesión con tu cuenta de GitHub
3. Autoriza la aplicación

### 2. Crear proyecto

1. En SonarCloud, crea un nuevo proyecto
2. Selecciona "From GitHub"
3. Elige tu repositorio
4. Copia el **Organization Key** y **Project Key**

### 3. Configurar en GitHub

1. Ve a **Settings → Secrets and variables → Actions**
2. Agrega el secret: `SONAR_TOKEN`
   - Obtén el token desde SonarCloud: **My Account → Security → Generate Token**

### 4. Actualizar sonar-project.properties

Actualiza las siguientes líneas con tus valores:

```properties
sonar.projectKey=TU_ORGANIZATION_KEY_TU_PROJECT_KEY
sonar.organization=TU_ORGANIZATION_KEY
```

## Qué Analiza SonarQube

### Calidad de Código
- **Bugs**: Errores en el código
- **Vulnerabilidades**: Problemas de seguridad
- **Code Smells**: Problemas de mantenibilidad
- **Duplicación**: Código duplicado

### Cobertura de Tests
- **Cobertura de líneas**
- **Cobertura de ramas**
- **Cobertura de funciones**

### Métricas
- **Líneas de código**
- **Complejidad ciclomática**
- **Deuda técnica**

## Integración en CI/CD

SonarQube se ejecuta automáticamente en:
- **Pull Requests**: Análisis completo con comentarios en el PR
- **Push a main**: Análisis completo y actualización del dashboard

### Flujo

1. Tests unitarios se ejecutan y generan cobertura
2. SonarQube analiza el código
3. SonarQube genera reporte con:
   - Análisis de calidad
   - Cobertura de tests
   - Sugerencias de mejora

## Ver Resultados

### En GitHub
- Los resultados aparecen como comentarios en Pull Requests
- Status checks muestran el estado del análisis

### En SonarCloud
- Dashboard completo en https://sonarcloud.io
- Métricas históricas
- Tendencias de calidad

## Configuración Actual

```properties
sonar.projectKey=TP8-Contenedores-Automatizacion
sonar.projectName=TP8 Contenedores y Automatización

# Directorios a analizar
sonar.sources=backend,frontend

# Exclusiones
sonar.exclusions=**/node_modules/**,**/test/**,**/tests/**,**/*.test.js

# Cobertura
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

## Troubleshooting

### Error: "SONAR_TOKEN not found"

1. Verifica que el secret esté configurado en GitHub
2. Verifica que el nombre sea exactamente `SONAR_TOKEN`

### Error: "Project key not found"

1. Verifica que el `sonar.projectKey` coincida con SonarCloud
2. Verifica que el proyecto exista en SonarCloud

### Cobertura no se muestra

1. Verifica que los tests generen reportes LCOV
2. Verifica que el path en `sonar.javascript.lcov.reportPaths` sea correcto
3. Revisa los logs del workflow
4. Verifica que `c8` esté instalado para generar cobertura del backend
5. Verifica que el archivo `coverage/lcov.info` se genere correctamente en el workflow

## Mejores Prácticas

1. **Revisa regularmente**: Revisa el dashboard de SonarCloud periódicamente
2. **Corrige issues**: Prioriza bugs y vulnerabilidades
3. **Mantén cobertura**: Apunta a al menos 70% de cobertura
4. **Usa Quality Gates**: Configura quality gates para bloquear PRs con problemas críticos

