# Tests End-to-End (E2E) con Cypress

Este documento describe los tests end-to-end implementados con Cypress.

## Configuración

Cypress está configurado en `cypress.config.js` y los tests están en `cypress/e2e/`.

### Instalación

```bash
# Instalar dependencias
npm install

# Abrir Cypress Test Runner (interfaz gráfica)
npm run test:e2e:open
```

## Ejecutar Tests E2E

### Localmente

```bash
# Ejecutar todos los tests E2E (headless)
npm run test:e2e

# Abrir Cypress Test Runner (interfaz gráfica)
npm run test:e2e:open

# Ejecutar en modo headed (ver el navegador)
npm run test:e2e:headed
```

### En CI/CD

Los tests E2E se ejecutan automáticamente en GitHub Actions después de los tests unitarios.

**Nota**: En CI, los servidores (backend y frontend) se inician automáticamente antes de ejecutar los tests.

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
- **Local**: Ejecuta en el navegador configurado (por defecto Electron)
- **CI**: Ejecuta en modo headless

El archivo `cypress.config.js` maneja esto automáticamente.

## Servidores

### Localmente

Antes de ejecutar los tests localmente, asegúrate de tener los servidores corriendo:

```bash
# Terminal 1: Backend
cd backend && PORT=3001 npm start

# Terminal 2: Frontend
cd frontend && python3 -m http.server 8080

# Terminal 3: Ejecutar tests
npm run test:e2e
```

### En CI/CD

Los servidores se inician automáticamente en el workflow de GitHub Actions.

## Reportes

- **Videos**: Generados en `cypress/videos/` (solo en fallos por defecto)
- **Screenshots**: Capturados automáticamente en fallos en `cypress/screenshots/`
- **Logs**: Disponibles en la consola y en GitHub Actions

## Estructura de Archivos

```
cypress/
├── e2e/
│   └── todo-app.cy.js      # Tests E2E principales
├── support/
│   ├── e2e.js              # Configuración de soporte
│   └── commands.js         # Comandos personalizados
└── fixtures/               # Datos de prueba (si se necesitan)
```

## Troubleshooting

### Los servidores no inician

Verifica que:
- Node.js 20+ esté instalado
- Python 3 esté instalado (para el servidor del frontend)
- Los puertos 3001 y 8080 estén disponibles

### Tests fallan en CI pero pasan localmente

- Verifica que las variables de entorno estén configuradas (`E2E_BASE_URL`)
- Revisa los logs del workflow en GitHub Actions
- Descarga los videos y screenshots desde los artifacts

### Cypress no encuentra los elementos

- Verifica que el `baseUrl` esté configurado correctamente en `cypress.config.js`
- Asegúrate de que los servidores estén corriendo antes de ejecutar los tests
- Usa `cy.wait()` si es necesario esperar a que elementos se carguen dinámicamente

## Mejores Prácticas

1. **Isolación**: Cada test es independiente
2. **Selectores**: Usar IDs y data-attributes cuando sea posible
3. **Waits**: Cypress espera automáticamente, pero puedes usar `cy.wait()` si es necesario
4. **Assertions**: Usar las assertions de Cypress (`should()`) para mejor feedback
5. **Comandos personalizados**: Crear comandos reutilizables en `cypress/support/commands.js`

## Comandos Útiles

```bash
# Ejecutar un test específico
npx cypress run --spec "cypress/e2e/todo-app.cy.js"

# Ejecutar en un navegador específico
npx cypress run --browser chrome

# Ver videos de tests fallidos
open cypress/videos
```
