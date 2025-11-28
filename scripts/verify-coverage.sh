#!/bin/bash
# Script para verificar localmente la generación de cobertura
# Simula el proceso del CI para asegurar que todo funciona antes de pushear

set -euo pipefail

echo "═══════════════════════════════════════════════════════════════"
echo "🔍 Verificación Local de Cobertura de Código"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo "📊 $1"
}

# Verificar que estamos en el directorio raíz
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
  print_error "Este script debe ejecutarse desde el directorio raíz del proyecto"
  exit 1
fi

# Limpiar cobertura anterior
echo "🧹 Limpiando cobertura anterior..."
rm -rf backend/coverage frontend/coverage coverage
mkdir -p coverage

# Verificar que c8 está instalado
if ! command -v c8 &> /dev/null; then
  print_warning "c8 no está instalado globalmente, instalando..."
  npm install -g c8 || {
    print_error "No se pudo instalar c8"
    exit 1
  }
fi

print_success "Herramientas verificadas"
echo ""

# ============================================
# PASO 1: Generar cobertura del backend
# ============================================
echo "═══════════════════════════════════════════════════════════════"
echo "📦 PASO 1: Generando cobertura del BACKEND"
echo "═══════════════════════════════════════════════════════════════"
echo ""

cd backend

# Matar cualquier proceso en el puerto 3001
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 1

print_info "Iniciando servidor con c8..."
PORT=3001 c8 --reporter=lcov --reporter=text --reporter=html \
  --include='server.js' --include='storage.js' \
  --exclude='test/**' --exclude='node_modules/**' \
  --exclude='data/**' \
  node server.js > /tmp/server.log 2>&1 &
SERVER_PID=$!

echo "⏳ Esperando que el servidor inicie (PID: $SERVER_PID)..."
sleep 6

# Verificar que el servidor está corriendo
if ! kill -0 $SERVER_PID 2>/dev/null; then
  print_error "El servidor no está corriendo"
  echo "📋 Server log:"
  cat /tmp/server.log || echo "No log available"
  exit 1
fi

# Verificar que el servidor responde
print_info "Verificando respuesta del servidor..."
for i in {1..5}; do
  if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Servidor respondiendo correctamente"
    break
  fi
  if [ $i -eq 5 ]; then
    print_error "El servidor no responde en /health"
    cat /tmp/server.log
    kill -9 $SERVER_PID 2>/dev/null || true
    exit 1
  fi
  echo "⏳ Esperando respuesta... ($i/5)"
  sleep 2
done

print_info "Ejecutando tests del backend..."
export TEST_PORT=3001
npm test > /tmp/test-output.log 2>&1 || {
  print_warning "Algunos tests pueden haber fallado, continuando..."
}

echo ""
print_info "Deteniendo servidor..."
kill -TERM $SERVER_PID 2>/dev/null || true

# Esperar a que termine
for i in {1..15}; do
  if ! kill -0 $SERVER_PID 2>/dev/null; then
    print_success "Servidor terminado"
    sleep 3
    break
  fi
  echo "⏳ Esperando que termine... ($i/15)"
  sleep 1
done

if kill -0 $SERVER_PID 2>/dev/null; then
  print_warning "Forzando terminación del servidor..."
  kill -9 $SERVER_PID 2>/dev/null || true
  sleep 3
fi

sleep 5

# Intentar forzar a c8 a escribir el reporte usando c8 report
print_info "Forzando generación del reporte LCOV desde datos de V8..."
if [ -d backend/coverage/tmp ] && [ "$(ls -A backend/coverage/tmp 2>/dev/null)" ]; then
  print_info "Regenerando reporte desde datos de cobertura V8..."
  (cd backend && c8 report --reporter=lcov --reporter=text \
    --include='server.js' --include='storage.js' \
    --exclude='test/**' --exclude='node_modules/**' \
    --exclude='data/**' \
    --temp-directory=coverage/tmp \
    --reports-dir=coverage 2>&1 | tail -10) || {
    print_warning "c8 report falló, pero continuando..."
  }
  sleep 2
fi

# Si lcov.info aún no existe o está vacío, verificar si hay datos
if [ ! -f backend/coverage/lcov.info ] || [ ! -s backend/coverage/lcov.info ]; then
  print_warning "lcov.info no existe o está vacío después de regenerar"
  if [ -d backend/coverage/tmp ]; then
    print_info "Archivos de cobertura V8 encontrados:"
    ls -lh backend/coverage/tmp/*.json 2>/dev/null | head -3 || echo "  (ninguno)"
  fi
fi

# Verificar reporte del backend
if [ -f backend/coverage/lcov.info ] && [ -s backend/coverage/lcov.info ]; then
  BACKEND_LINES=$(wc -l < backend/coverage/lcov.info)
  BACKEND_SOURCE_FILES=$(grep -c "^SF:" backend/coverage/lcov.info || echo "0")
  
  if [ "$BACKEND_LINES" -gt 10 ] && [ "$BACKEND_SOURCE_FILES" -gt 0 ]; then
    print_success "Backend coverage generado: ${BACKEND_LINES} líneas, ${BACKEND_SOURCE_FILES} archivos"
    echo ""
    print_info "Archivos fuente en el reporte del backend:"
    grep "^SF:" backend/coverage/lcov.info | sed 's|^SF:||' | while read file; do
      echo "  - $(basename "$file")"
    done
  else
    print_error "Backend coverage inválido: ${BACKEND_LINES} líneas, ${BACKEND_SOURCE_FILES} archivos"
    exit 1
  fi
else
  print_error "Backend coverage no encontrado o está vacío"
  exit 1
fi

echo ""
echo ""

# ============================================
# PASO 2: Generar cobertura del frontend
# ============================================
echo "═══════════════════════════════════════════════════════════════"
echo "📦 PASO 2: Generando cobertura del FRONTEND"
echo "═══════════════════════════════════════════════════════════════"
echo ""

cd frontend

print_info "Ejecutando tests del frontend con cobertura..."
npm run test:coverage > /tmp/frontend-test-output.log 2>&1 || {
  print_warning "Algunos tests pueden haber fallado, continuando..."
}

cd ..

if [ -f frontend/coverage/lcov.info ] && [ -s frontend/coverage/lcov.info ]; then
  FRONTEND_LINES=$(wc -l < frontend/coverage/lcov.info)
  FRONTEND_SOURCE_FILES=$(grep -c "^SF:" frontend/coverage/lcov.info || echo "0")
  
  if [ "$FRONTEND_LINES" -gt 10 ] && [ "$FRONTEND_SOURCE_FILES" -gt 0 ]; then
    print_success "Frontend coverage generado: ${FRONTEND_LINES} líneas, ${FRONTEND_SOURCE_FILES} archivos"
  else
    print_error "Frontend coverage inválido"
    exit 1
  fi
else
  print_error "Frontend coverage no encontrado o está vacío"
  exit 1
fi

echo ""
echo ""

# ============================================
# PASO 3: Combinar reportes
# ============================================
echo "═══════════════════════════════════════════════════════════════"
echo "🔗 PASO 3: Combinando reportes de cobertura"
echo "═══════════════════════════════════════════════════════════════"
echo ""

BACKEND_COVERAGE_EXISTS=false
FRONTEND_COVERAGE_EXISTS=false

# Normalizar y agregar backend
if [ -f backend/coverage/lcov.info ] && [ -s backend/coverage/lcov.info ]; then
  BACKEND_LINES=$(wc -l < backend/coverage/lcov.info)
  BACKEND_SOURCE_FILES=$(grep -c "^SF:" backend/coverage/lcov.info || echo "0")
  
  if [ "$BACKEND_LINES" -gt 10 ] && [ "$BACKEND_SOURCE_FILES" -gt 0 ]; then
    print_info "Agregando backend coverage..."
    sed 's|^SF:.*/backend/|SF:backend/|g; s|^SF:backend/|SF:backend/|g' backend/coverage/lcov.info > /tmp/backend-coverage-normalized.lcov
    cp /tmp/backend-coverage-normalized.lcov coverage/lcov.info
    BACKEND_COVERAGE_EXISTS=true
    print_success "Backend agregado: ${BACKEND_SOURCE_FILES} archivos"
  fi
fi

# Normalizar y agregar frontend
if [ -f frontend/coverage/lcov.info ] && [ -s frontend/coverage/lcov.info ]; then
  FRONTEND_LINES=$(wc -l < frontend/coverage/lcov.info)
  FRONTEND_SOURCE_FILES=$(grep -c "^SF:" frontend/coverage/lcov.info || echo "0")
  
  if [ "$FRONTEND_LINES" -gt 10 ] && [ "$FRONTEND_SOURCE_FILES" -gt 0 ]; then
    print_info "Agregando frontend coverage..."
    sed 's|^SF:.*/frontend/|SF:frontend/|g; s|^SF:frontend/|SF:frontend/|g' frontend/coverage/lcov.info > /tmp/frontend-coverage-normalized.lcov
    grep -v "^TN:" /tmp/frontend-coverage-normalized.lcov >> coverage/lcov.info || cat /tmp/frontend-coverage-normalized.lcov >> coverage/lcov.info
    FRONTEND_COVERAGE_EXISTS=true
    print_success "Frontend agregado: ${FRONTEND_SOURCE_FILES} archivos"
  fi
fi

echo ""

# ============================================
# PASO 4: Verificar reporte combinado
# ============================================
echo "═══════════════════════════════════════════════════════════════"
echo "✅ PASO 4: Verificando reporte combinado"
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ -f coverage/lcov.info ] && [ -s coverage/lcov.info ]; then
  FINAL_LINES=$(wc -l < coverage/lcov.info)
  FINAL_SOURCE_FILES=$(grep -c "^SF:" coverage/lcov.info || echo "0")
  
  if [ "$FINAL_LINES" -gt 10 ] && [ "$FINAL_SOURCE_FILES" -gt 0 ]; then
    print_success "Reporte combinado generado: ${FINAL_LINES} líneas, ${FINAL_SOURCE_FILES} archivos"
    echo ""
    
    print_info "Archivos fuente en el reporte combinado:"
    grep "^SF:" coverage/lcov.info | sed 's|^SF:||' | sort | uniq
    echo ""
    
    # Verificar archivos específicos
    HAS_BACKEND_SERVER=$(grep -c "^SF:backend/server.js" coverage/lcov.info || echo "0")
    HAS_BACKEND_STORAGE=$(grep -c "^SF:backend/storage.js" coverage/lcov.info || echo "0")
    HAS_FRONTEND_APP=$(grep -c "^SF:frontend/app.js" coverage/lcov.info || echo "0")
    HAS_FRONTEND_CONFIG=$(grep -c "^SF:frontend/config.js" coverage/lcov.info || echo "0")
    
    echo "📊 Verificación de archivos requeridos:"
    echo ""
    if [ "$HAS_BACKEND_SERVER" -gt 0 ]; then
      print_success "backend/server.js incluido"
    else
      print_error "backend/server.js NO incluido"
    fi
    
    if [ "$HAS_BACKEND_STORAGE" -gt 0 ]; then
      print_success "backend/storage.js incluido"
    else
      print_error "backend/storage.js NO incluido"
    fi
    
    if [ "$HAS_FRONTEND_APP" -gt 0 ]; then
      print_success "frontend/app.js incluido"
    else
      print_warning "frontend/app.js NO incluido"
    fi
    
    if [ "$HAS_FRONTEND_CONFIG" -gt 0 ]; then
      print_success "frontend/config.js incluido"
    else
      print_warning "frontend/config.js NO incluido (puede estar bien si está excluido)"
    fi
    
    echo ""
    
    # Calcular cobertura total
    print_info "Calculando cobertura total..."
    TOTAL_LF=$(grep "^LF:" coverage/lcov.info | awk '{sum+=$2} END {print sum}')
    TOTAL_LH=$(grep "^LH:" coverage/lcov.info | awk '{sum+=$2} END {print sum}')
    
    if [ -n "$TOTAL_LF" ] && [ "$TOTAL_LF" -gt 0 ]; then
      TOTAL_COVERAGE=$(echo "scale=2; ($TOTAL_LH * 100) / $TOTAL_LF" | bc 2>/dev/null || echo "0")
      echo ""
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      print_info "COBERTURA TOTAL: ${TOTAL_COVERAGE}%"
      echo "  - Líneas totales: ${TOTAL_LF}"
      echo "  - Líneas cubiertas: ${TOTAL_LH}"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      
      if (( $(echo "$TOTAL_COVERAGE >= 70" | bc -l 2>/dev/null || echo "0") )); then
        print_success "Cobertura >= 70% requerido ✅"
      else
        print_warning "Cobertura < 70% requerido (actual: ${TOTAL_COVERAGE}%)"
      fi
    fi
    
    # Verificar que no falte el backend
    if [ "$HAS_BACKEND_SERVER" -eq 0 ] || [ "$HAS_BACKEND_STORAGE" -eq 0 ]; then
      echo ""
      print_error "FALTAN ARCHIVOS DEL BACKEND EN EL REPORTE"
      echo ""
      print_error "SonarCloud NO mostrará cobertura del backend"
      echo ""
      exit 1
    fi
    
    echo ""
    print_success "¡Reporte combinado válido y listo para SonarCloud! 🎉"
    echo ""
    print_info "Ubicación del reporte: coverage/lcov.info"
    print_info "Este archivo será leído por SonarCloud según sonar-project.properties"
    
  else
    print_error "Reporte combinado inválido: ${FINAL_LINES} líneas, ${FINAL_SOURCE_FILES} archivos"
    exit 1
  fi
else
  print_error "No se pudo generar el reporte combinado"
  exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
print_success "¡Verificación completada exitosamente! ✅"
echo "═══════════════════════════════════════════════════════════════"

