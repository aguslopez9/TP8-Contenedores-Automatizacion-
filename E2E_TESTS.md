# Tests End-to-End (E2E) con Playwright

Este documento describe los tests end-to-end implementados con Playwright.

## Configuración

Playwright está configurado en `playwright.config.js` y los tests están en `tests/e2e/`.

### Instalación

```bash
# Instalar dependencias
npm install

# Instalar navegadores de Playwright
npx playwright install
```

## Ejecutar Tests E2E

### Localmente

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar con UI interactiva
npm run test:e2e:ui

# Ejecutar en modo headed (ver el navegador)
npm run test:e2e:headed

# Ver reporte HTML
npm run test:e2e:report
```

### En CI/CD

Los tests E2E se ejecutan automáticamente en GitHub Actions después de los tests unitarios.

## Tests Implementados

### 1. Carga de la aplicación
- Verifica que la aplicación carga correctamente
- Valida elementos básicos del DOM

### 2. Creación de todos
- Crear todo con prioridad alta
- Crear todo con prioridad media
- Crear todo con prioridad baja
- Validación de que el todo aparece en la lista

### 3. Gestión de todos
- Marcar todo como completado
- Eliminar un todo
- Verificar contador de todos

### 4. Filtrado
- Filtrar por completados
- Filtrar por pendientes
- Verificar que los filtros funcionan correctamente

### 5. Búsqueda
- Buscar todos por texto
- Verificar que los resultados se filtran correctamente

### 6. Estadísticas
- Verificar que las estadísticas se muestran
- Validar que se actualizan correctamente

### 7. Operaciones en lote
- Marcar todos como completados
- Eliminar todos los completados
- Verificar confirmaciones

### 8. Validaciones
- No crear todos vacíos
- Validar formularios

## Configuración de Ambientes

Los tests se configuran automáticamente para:
- **Local**: Ejecuta en Chromium, Firefox y WebKit
- **CI**: Ejecuta solo en Chromium (más rápido)

El archivo `playwright.config.js` maneja esto automáticamente según la variable de entorno `CI`.

## Servidores Automáticos

Playwright inicia automáticamente:
- Backend en puerto 3001
- Frontend en puerto 8080

Los servidores se detienen automáticamente después de los tests.

## Reportes

- **HTML**: Generado en `playwright-report/`
- **JUnit XML**: Generado en `test-results/e2e-results.xml` (para CI)
- **Screenshots**: Capturados automáticamente en fallos
- **Traces**: Disponibles en modo retry

## Troubleshooting

### Los servidores no inician

Verifica que:
- Node.js 20+ esté instalado
- Python 3 esté instalado (para el servidor del frontend)
- Los puertos 3001 y 8080 estén disponibles

### Tests fallan en CI pero pasan localmente

- Verifica que las variables de entorno estén configuradas
- Revisa los logs del workflow en GitHub Actions
- Descarga el reporte HTML desde los artifacts

## Mejores Prácticas

1. **Isolación**: Cada test es independiente
2. **Selectores**: Usar IDs y data-attributes cuando sea posible
3. **Waits**: Playwright espera automáticamente, pero puedes agregar waits explícitos si es necesario
4. **Assertions**: Usar las assertions de Playwright para mejor feedback

