# Análisis: Por qué la Cobertura Bajó

## 🔍 Problema

La cobertura de código es más baja ahora que antes de los cambios recientes.

## 📊 Posibles Causas

### 1. Cambio en cómo se mide la cobertura

**Antes**: Es posible que la cobertura se midiera de forma incorrecta o parcial:
- Los tests no ejecutaban el código real
- La cobertura reportada podría haber sido de código no ejecutado
- O la cobertura se medía solo de `storage.js` (que tiene 95.8%)

**Ahora**: Estamos midiendo la cobertura real:
- Intentamos ejecutar el código real durante los tests
- Pero puede que no se esté ejecutando correctamente
- O que el reporte no se esté generando bien

### 2. Problema con c8 y el servidor en background

**Problema identificado**:
```bash
# Configuración actual
c8 node server.js &  # Servidor en background
# ... ejecutar tests ...
kill $SERVER_PID    # Matar servidor
```

**Problema**: `c8` necesita que el proceso termine normalmente para escribir el reporte LCOV. Si el proceso se mata abruptamente, `c8` no puede escribir el reporte.

**Solución aplicada**: Enviar `SIGTERM` primero, dar tiempo para que `c8` escriba el reporte, luego `SIGKILL` si es necesario.

### 3. Import de app.js en tests

**Problema**: Al importar `app.js` en los tests:
- El código se ejecuta inmediatamente
- `DOMContentLoaded` puede dispararse
- Puede interferir con los tests
- Pero Jest necesita el import para rastrear cobertura

**Estado actual**: El import está presente, pero puede que no esté funcionando correctamente.

### 4. Reportes LCOV no se están generando correctamente

**Posible problema**: Los reportes LCOV pueden estar:
- Vacíos o incompletos
- No incluyendo todos los archivos
- Siendo sobrescritos o no combinados correctamente

## 🔧 Soluciones Aplicadas

### 1. Mejorar terminación del servidor

```bash
# Enviar SIGTERM primero (permite que c8 escriba el reporte)
kill -TERM $SERVER_PID
sleep 3
# Si aún está corriendo, forzar terminación
kill -9 $SERVER_PID
```

### 2. Verificar que los reportes se generen

Agregada verificación para confirmar que el reporte LCOV se generó correctamente.

### 3. Mantener import de app.js

El import es necesario para que Jest rastree la cobertura, aunque pueda causar ejecución inmediata.

## 📈 Próximos Pasos

1. **Verificar logs del workflow**: Revisar si los reportes LCOV se están generando
2. **Revisar cobertura local**: Ejecutar tests localmente y verificar la cobertura
3. **Mejorar tests**: Asegurar que los tests ejecuten más código real
4. **Verificar reportes LCOV**: Confirmar que los reportes incluyen datos reales

## 🎯 Cobertura Esperada vs Real

**Cobertura esperada** (después de correcciones):
- `storage.js`: 95.8% ✅
- `server.js`: ~70-80%
- `app.js`: ~50-60%
- **Total**: ~70-75%

**Cobertura actual** (según SonarCloud):
- `storage.js`: 95.8% ✅
- `server.js`: 0.0% ❌
- `app.js`: 0.0% ❌
- **Total**: ~42% (solo storage.js)

## 💡 Conclusión

La cobertura puede haber bajado porque:

1. **Antes**: Se medía incorrectamente o solo se medía `storage.js`
2. **Ahora**: Estamos intentando medir correctamente, pero:
   - `c8` no está capturando la cobertura del servidor
   - Los tests no están ejecutando el código real
   - Los reportes LCOV no se están generando correctamente

**Solución**: Necesitamos asegurar que:
1. `c8` capture correctamente la cobertura del servidor
2. Los tests ejecuten el código real
3. Los reportes LCOV se generen y combinen correctamente

