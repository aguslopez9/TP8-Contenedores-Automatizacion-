# Explicación de la Cobertura de Código Baja

## 📊 Situación Actual

Según SonarCloud, la cobertura es **42.0%** con:
- `frontend/app.js`: **0.0%** (171 líneas sin cubrir)
- `frontend/config.js`: **0.0%** (1 línea sin cubrir)
- `backend/server.js`: **0.0%** (130 líneas sin cubrir)
- `backend/storage.js`: **95.8%** ✅ (6 líneas sin cubrir)

## 🔍 Causa del Problema

### Frontend (app.js - 0% cobertura)

**Problema**: Los tests no están ejecutando el código real de `app.js`.

1. **`app.js` no exporta funciones**: Usa scope global, por lo que las funciones no son accesibles directamente desde los tests
2. **Tests mockean `fetch`**: Los tests solo prueban que `fetch` se llama, pero no ejecutan las funciones reales de `app.js`
3. **Jest no puede rastrear**: Sin importar y ejecutar el código, Jest no puede medir la cobertura

**Ejemplo del problema**:
```javascript
// Test actual (NO ejecuta código de app.js)
test("loadTodos should make GET request", async () => {
  await fetch("http://localhost:3001/todos"); // Solo mockea fetch
  // ❌ No ejecuta la función loadTodos() de app.js
});
```

### Backend (server.js - 0% cobertura)

**Problema**: `c8` no está rastreando correctamente el servidor cuando maneja requests.

1. **Servidor se ejecuta en proceso separado**: El servidor corre en background, pero `c8` rastrea los tests, no el servidor
2. **Tests hacen HTTP requests**: Los tests hacen requests HTTP al servidor, pero `c8` no rastrea el código que maneja esas requests
3. **Cobertura solo del test runner**: `c8` solo rastrea el código ejecutado por el test runner, no el servidor

## ✅ Soluciones Aplicadas

### 1. Frontend - Importar app.js

Agregado `import "../app.js"` en los tests para que Jest pueda rastrear la cobertura.

**Limitación**: Como `app.js` usa scope global y se ejecuta en `DOMContentLoaded`, algunas funciones pueden no ejecutarse durante los tests.

### 2. Backend - Rastrear servidor con c8

Modificado el workflow para que `c8` rastree el servidor cuando se ejecuta:

```bash
# Antes: c8 solo rastreaba los tests
c8 node --test test/*.test.js

# Ahora: c8 rastrea el servidor
c8 --include='server.js' node server.js &
# Luego ejecutar tests que hacen requests al servidor
```

## 📈 Mejoras Necesarias para Aumentar Cobertura

### Frontend

Para aumentar la cobertura de `app.js`, los tests deberían:

1. **Ejecutar funciones reales**: En lugar de solo mockear `fetch`, ejecutar las funciones de `app.js`
2. **Simular eventos DOM**: Disparar eventos reales que ejecuten el código
3. **Refactorizar app.js**: Exportar funciones para hacerlas testeables

**Ejemplo de mejora**:
```javascript
// En lugar de solo mockear fetch:
test("loadTodos should load todos", async () => {
  fetch.mockResolvedValue({ ok: true, json: async () => ({ todos: [] }) });
  await loadTodos(); // ✅ Ejecuta función real
  expect(state.todos).toEqual([]);
});
```

### Backend

Para aumentar la cobertura de `server.js`:

1. **Asegurar que c8 rastree el servidor**: El servidor debe ejecutarse con `c8`
2. **Ejecutar todos los endpoints**: Los tests deben cubrir todos los endpoints y casos de error
3. **Verificar que el reporte LCOV incluya server.js**: El reporte debe incluir datos de cobertura

## 🎯 Cobertura Esperada

Con las correcciones aplicadas:

- **storage.js**: Ya tiene 95.8% ✅
- **server.js**: Debería aumentar de 0% a ~70-80% (depende de cuántos endpoints se prueben)
- **app.js**: Debería aumentar de 0% a ~50-60% (limitado por funciones en scope global)
- **config.js**: Debería llegar a 100% (es un archivo simple)

**Cobertura total esperada**: ~70-75%

## 🔧 Próximos Pasos

1. **Verificar que los cambios funcionen**: Ejecutar el workflow y ver si la cobertura aumenta
2. **Mejorar tests del frontend**: Hacer que los tests ejecuten funciones reales
3. **Aumentar tests del backend**: Agregar más casos de prueba para server.js
4. **Refactorizar si es necesario**: Considerar exportar funciones de app.js para mejor testabilidad

## 📝 Nota Importante

La cobertura de 42% actual es principalmente de `storage.js` (95.8%). Los otros archivos tienen 0% porque:

- Los tests no ejecutan el código real
- Las herramientas de cobertura no pueden rastrear código no ejecutado
- `app.js` y `server.js` necesitan ejecutarse durante los tests para ser rastreados

Las correcciones aplicadas deberían mejorar esto significativamente.

