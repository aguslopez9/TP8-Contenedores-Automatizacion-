# Configuración de Code Coverage para SonarQube

Este documento explica cómo se genera y analiza el code coverage en SonarQube.

## Generación de Cobertura

### Frontend

El frontend usa **Jest** que genera reportes LCOV automáticamente:

```bash
cd frontend
npm run test:coverage
```

Esto genera:
- `frontend/coverage/lcov.info` - Reporte LCOV para SonarQube
- `frontend/coverage/index.html` - Reporte HTML visual

### Backend

El backend usa el test runner nativo de Node.js con **c8** para generar LCOV:

```bash
cd backend
PORT=3001 npm start &  # Iniciar servidor en background
export TEST_PORT=3001
c8 --reporter=lcov --reporter=text --reporter=html node --test test/*.test.js
pkill -f "node server.js"  # Detener servidor
```

Esto genera:
- `backend/coverage/lcov.info` - Reporte LCOV para SonarQube
- `backend/coverage/index.html` - Reporte HTML visual

## En CI/CD

El workflow de GitHub Actions (`ci.yml`) genera y combina la cobertura automáticamente:

1. **Instala c8** (herramienta para generar LCOV desde Node.js coverage)
2. **Genera cobertura del backend** usando c8
3. **Genera cobertura del frontend** usando Jest
4. **Combina ambos reportes** en `coverage/lcov.info`
5. **SonarQube analiza** el reporte combinado

## Configuración en SonarQube

El archivo `sonar-project.properties` está configurado para leer el reporte:

```properties
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

## Ver Cobertura

### Localmente

**Frontend:**
```bash
cd frontend
npm run test:coverage
open coverage/index.html
```

**Backend:**
```bash
cd backend
PORT=3001 npm start &
export TEST_PORT=3001
c8 --reporter=html node --test test/*.test.js
open coverage/index.html
pkill -f "node server.js"
```

### En SonarCloud

1. Ve a tu proyecto en https://sonarcloud.io
2. Navega a la pestaña **"Measures"** o **"Code"**
3. Verás:
   - **Coverage**: Porcentaje de líneas cubiertas
   - **Line Coverage**: Líneas cubiertas vs totales
   - **Branch Coverage**: Ramas cubiertas vs totales
   - **Uncovered Lines**: Líneas sin cobertura

### En GitHub

- Los resultados aparecen en **Pull Requests** como comentarios
- Status checks muestran el estado de la cobertura
- Puedes ver tendencias en el dashboard de SonarCloud

## Troubleshooting

### Cobertura no aparece en SonarCloud

1. **Verifica que el workflow genere el archivo:**
   ```bash
   # Revisa los logs del workflow en GitHub Actions
   # Busca "Coverage report merged successfully"
   ```

2. **Verifica el formato LCOV:**
   ```bash
   # El archivo debe empezar con "TN:" y contener "SF:", "LF:", "LH:"
   head -20 coverage/lcov.info
   ```

3. **Verifica la ruta en sonar-project.properties:**
   ```properties
   sonar.javascript.lcov.reportPaths=coverage/lcov.info
   ```

4. **Verifica que c8 esté instalado:**
   ```bash
   # En el workflow debe aparecer:
   # "npm install -g c8"
   ```

### Cobertura del backend no se genera

1. **Verifica que el servidor esté corriendo:**
   ```bash
   # Algunos tests requieren el servidor activo
   PORT=3001 npm start &
   ```

2. **Verifica que c8 esté instalado:**
   ```bash
   npm install -g c8
   ```

3. **Ejecuta manualmente:**
   ```bash
   cd backend
   PORT=3001 npm start &
   sleep 3
   export TEST_PORT=3001
   c8 --reporter=lcov node --test test/*.test.js
   ```

## Mejores Prácticas

1. **Mantén cobertura alta**: Apunta a al menos 70% de cobertura
2. **Cubre casos críticos**: Asegúrate de cubrir lógica de negocio importante
3. **Revisa regularmente**: Revisa el dashboard de SonarCloud periódicamente
4. **Corrige líneas sin cobertura**: Prioriza las líneas más importantes

## Métricas de Cobertura

SonarQube muestra:
- **Line Coverage**: % de líneas ejecutadas
- **Branch Coverage**: % de ramas (if/else) ejecutadas
- **Condition Coverage**: % de condiciones evaluadas
- **Uncovered Lines**: Lista de líneas sin cobertura

