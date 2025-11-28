# Configuración de Quality Gates

Este documento explica cómo configurar Quality Gates en SonarCloud para bloquear el deploy si no se cumplen los criterios de calidad.

## 🎯 Objetivos

Los Quality Gates bloquean el deploy si:
1. **Cobertura de código < 70%**
2. **Issues críticos sin resolver**
3. **Tests de integración fallan** (ya configurado)

## 📋 Configuración en SonarCloud

### 1. Crear/Configurar Quality Gate Personalizado

1. Ve a https://sonarcloud.io
2. Selecciona tu proyecto: `TP8-Contenedores-Automatizacion-`
3. Ve a **Quality Gates → Create**
4. Nombre: `TP8 Quality Gate` (o el que prefieras)

### 2. Configurar Condiciones

Agrega las siguientes condiciones:

#### Cobertura de Código
- **Condition**: Coverage on New Code
- **Operator**: is less than
- **Value**: 70
- **Action**: Error

#### Issues Críticos
- **Condition**: New Critical Issues
- **Operator**: is greater than
- **Value**: 0
- **Action**: Error

#### Issues de Blocker
- **Condition**: New Blocker Issues
- **Operator**: is greater than
- **Value**: 0
- **Action**: Error

#### Vulnerabilidades
- **Condition**: New Security Hotspots
- **Operator**: is greater than
- **Value**: 0
- **Action**: Warning (opcional, puede ser Error)

### 3. Asignar Quality Gate al Proyecto

1. Ve a **Project Settings → Quality Gates**
2. Selecciona tu Quality Gate personalizado
3. Guarda los cambios

## 🔧 Integración en GitHub Actions

El workflow de deploy ahora verifica el Quality Gate antes de desplegar.

### Flujo

1. **CI ejecuta análisis de SonarQube**
2. **Deploy verifica Quality Gate** (nuevo step)
3. **Si Quality Gate pasa** → Continúa con deploy
4. **Si Quality Gate falla** → Deploy se bloquea

## ✅ Verificación Automática

El workflow verifica automáticamente:
- ✅ Cobertura >= 70%
- ✅ Sin issues críticos nuevos
- ✅ Sin issues blocker nuevos
- ✅ Tests de integración pasan (ya configurado)

## 📊 Ver Estado del Quality Gate

### En SonarCloud
1. Ve a tu proyecto
2. Pestaña **"Measures"** o **"Overview"**
3. Verás el estado del Quality Gate (✅ Pass / ❌ Fail)

### En GitHub Actions
- El step "Check SonarCloud Quality Gate" muestra el estado
- Si falla, el deploy se detiene con un mensaje claro

## 🚨 Qué Pasa si Falla

Si el Quality Gate falla:
1. **El deploy a QA se bloquea**
2. **El deploy a PROD se bloquea** (depende de QA)
3. **Se muestra un error claro** en GitHub Actions
4. **Debes corregir los problemas** antes de poder desplegar

## 🔍 Troubleshooting

### Quality Gate siempre falla

1. Verifica que la cobertura sea >= 70%
2. Revisa issues críticos en SonarCloud
3. Corrige los problemas reportados
4. Haz un nuevo push para re-evaluar

### No se puede verificar el Quality Gate

1. Verifica que `SONAR_TOKEN` esté configurado
2. Verifica que el `projectKey` sea correcto
3. Revisa los logs del workflow

## 📝 Notas

- El Quality Gate se evalúa sobre **"New Code"** (código nuevo desde la última versión)
- Los issues existentes no bloquean (solo los nuevos)
- La cobertura se mide sobre todo el código, no solo el nuevo

