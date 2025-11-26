# GitHub Actions Workflows - Documentación

Este documento explica el flujo completo de CI/CD del proyecto.

## Flujo de Desarrollo

### 1. Pull Request (PR)

Cuando se abre un PR hacia `main`:

1. **Workflow CI se ejecuta automáticamente**
   - Build del frontend
   - Build del backend
   - Ejecución de tests unitarios (frontend y backend)
   - Validación de sintaxis y linting
   - **NO se publica imagen Docker** (solo en push a main)

2. **Validación de Tests**
   - Si algún test falla → El PR muestra el error
   - El PR no puede ser mergeado hasta que todos los tests pasen
   - Los resultados se muestran en la pestaña "Checks" del PR

### 2. PR Aprobado y Mergeado

Cuando un PR es aprobado y mergeado a `main`:

1. **Push a main** → Trigger automático del workflow CI
2. **CI ejecuta**:
   - Build completo
   - Tests unitarios (deben pasar)
   - Publicación de imagen Docker a GHCR

3. **Si CI es exitoso** → Workflow Deploy se ejecuta automáticamente

### 3. Deploy a QA

El workflow Deploy se ejecuta automáticamente después de CI exitoso:

1. **Deploy QA**:
   - Descarga artefactos del CI
   - Inyecta configuración de QA
   - Despliega frontend a Netlify (QA)
   - Promueve imagen Docker a tag `:qa`
   - Despliega backend a Render (QA)
   - Health check del backend

2. **Tests de Integración**:
   - Se ejecutan automáticamente contra el ambiente QA
   - Validan endpoints y funcionalidad end-to-end
   - **Si fallan → El pipeline se detiene**

3. **Si todo pasa** → Se habilita el deploy a PROD (requiere aprobación manual)

### 4. Deploy a PROD

El deploy a PROD requiere **aprobación manual**:

1. **Aprobación Manual**:
   - Aparece una notificación en GitHub Actions
   - Un usuario con permisos debe aprobar manualmente
   - Esto asegura control sobre qué código va a producción

2. **Deploy PROD**:
   - Descarga artefactos del CI
   - Inyecta configuración de PROD
   - Despliega frontend a Netlify (PROD)
   - Promueve imagen Docker a tag `:prod`
   - Despliega backend a Render (PROD)
   - Health check del backend

## Validación de Fallos

### Tests Unitarios

- **Ubicación**: Workflow CI, jobs `build_frontend` y `build_backend`
- **Configuración**: `continue-on-error: false`
- **Comportamiento**: Si cualquier test falla:
  - El job falla inmediatamente
  - El pipeline se detiene
  - No se ejecuta el deploy
  - El PR no puede ser mergeado (si es PR)

### Tests de Integración

- **Ubicación**: Workflow Deploy, job `deploy_qa`
- **Configuración**: `set -euo pipefail`
- **Comportamiento**: Si cualquier test falla:
  - El step falla inmediatamente
  - El job `deploy_qa` falla
  - El job `deploy_prod` no se ejecuta (depende de `deploy_qa`)

## Reportes de Tests

### Tests Unitarios

Los resultados de los tests unitarios se muestran en:
- **GitHub Step Summary**: Resumen visible en la pestaña "Summary" del workflow
- **Logs del workflow**: Output completo en la pestaña "Actions"
- **Status Checks**: Estado visible en el PR

### Tests de Integración

Los resultados de los tests de integración se muestran en:
- **GitHub Step Summary**: Resumen con lista de tests ejecutados
- **Logs del workflow**: Output detallado de cada test

## Configuración Requerida

### Branch Protection Rules

Para asegurar que solo código validado se mergee, configurar en GitHub:

**Settings → Branches → Branch protection rules → main**

- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Seleccionar los checks: `build_frontend`, `build_backend`

### Environments

Configurar en **Settings → Environments**:

1. **Environment: `qa`**
   - Sin aprobación requerida
   - Variables y secrets de QA

2. **Environment: `prod`**
   - ✅ Require reviewers (aprobación manual)
   - Variables y secrets de PROD

## Diagrama de Flujo

```
PR Abierto
    ↓
CI ejecuta tests
    ↓
¿Tests pasan?
    ├─ NO → PR muestra error, no se puede mergear
    └─ SÍ → PR puede ser aprobado
            ↓
        PR Mergeado a main
            ↓
        Push a main
            ↓
        CI ejecuta (build + tests + Docker)
            ↓
        ¿CI exitoso?
            ├─ NO → Pipeline detenido
            └─ SÍ → Deploy a QA
                    ↓
                Tests de Integración
                    ↓
                ¿Tests pasan?
                    ├─ NO → Pipeline detenido
                    └─ SÍ → Aprobación Manual PROD
                            ↓
                        ¿Aprobado?
                            ├─ NO → Pipeline detenido
                            └─ SÍ → Deploy a PROD
```

## Troubleshooting

### Tests fallan en CI pero pasan localmente

- Verificar que las dependencias estén actualizadas (`npm ci`)
- Verificar que el servidor esté corriendo para tests del backend
- Revisar logs completos en GitHub Actions

### Deploy no se ejecuta después de merge

- Verificar que el CI completó exitosamente
- Verificar que el commit está en la rama `main`
- Revisar la condición `if` en el workflow Deploy

### Tests de integración fallan

- Verificar que el ambiente QA esté funcionando
- Verificar variables de entorno (`QA_BACKEND_URL`)
- Revisar logs del deploy de QA

