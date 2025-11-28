# Solución: Error "Automatic Analysis is enabled"

## ⚠️ Error

```
You are running CI analysis while Automatic Analysis is enabled. 
Please consider disabling one or the other.
```

## 🔍 Causa

SonarCloud tiene **"Automatic Analysis"** habilitado, que analiza automáticamente el código cuando haces push. Pero también estás ejecutando análisis desde GitHub Actions (CI), y SonarCloud no permite ambos al mismo tiempo.

## ✅ Solución: Deshabilitar Automatic Analysis

### Opción 1: Desde SonarCloud (Recomendado)

1. Ve a https://sonarcloud.io
2. Selecciona tu proyecto: `TP8-Contenedores-Automatizacion-`
3. Ve a **Project Settings → General**
4. Busca la sección **"Automatic Analysis"**
5. **Deshabilita** "Automatic Analysis"
6. Guarda los cambios

### Opción 2: Desde la configuración del proyecto

1. Ve a tu proyecto en SonarCloud
2. **Administration → Analysis Method**
3. Selecciona **"With GitHub Actions"** (o "CI/CD")
4. Deshabilita **"Automatic Analysis"**
5. Guarda

## 🎯 Por qué deshabilitar Automatic Analysis

- **Ventajas de usar CI/CD**:
  - Control total sobre cuándo se ejecuta
  - Integración con tu pipeline
  - Reportes en Pull Requests
  - Cobertura de tests incluida
  - No consume recursos automáticos de SonarCloud

- **Desventajas de Automatic Analysis**:
  - Se ejecuta en cada push (puede ser lento)
  - No tienes control sobre cuándo se ejecuta
  - Puede conflictuar con análisis de CI

## ✅ Después de deshabilitar

1. Haz un nuevo push o crea un Pull Request
2. El análisis desde CI debería ejecutarse sin errores
3. Verás los resultados en:
   - SonarCloud dashboard
   - Comentarios en Pull Requests
   - GitHub Actions logs

## 🔍 Verificar que está deshabilitado

1. Ve a **Project Settings → General**
2. Verifica que **"Automatic Analysis"** esté en **OFF** o **Disabled**
3. Debería decir algo como: **"Analysis via CI/CD"** o **"With GitHub Actions"**

## 📝 Nota

Si prefieres usar Automatic Analysis en lugar de CI/CD:
- Deshabilita el job `sonarqube` en el workflow de CI
- Habilita Automatic Analysis en SonarCloud
- Pero perderás control sobre cuándo se ejecuta y la integración con tu pipeline

**Recomendación**: Usa CI/CD (como está configurado ahora) y deshabilita Automatic Analysis.

