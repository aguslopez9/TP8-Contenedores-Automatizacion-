#!/bin/bash
# Script para verificar el Quality Gate de SonarCloud
# Uso: ./check_quality_gate.sh <SONAR_TOKEN> <PROJECT_KEY> <ORGANIZATION>

set -euo pipefail

SONAR_TOKEN="${1:-}"
PROJECT_KEY="${2:-}"
ORGANIZATION="${3:-}"

if [ -z "$SONAR_TOKEN" ] || [ -z "$PROJECT_KEY" ] || [ -z "$ORGANIZATION" ]; then
  echo "❌ Error: Faltan parámetros"
  echo "Uso: $0 <SONAR_TOKEN> <PROJECT_KEY> <ORGANIZATION>"
  exit 1
fi

echo "🔍 Verificando SonarCloud Quality Gate..."
echo "Project: ${PROJECT_KEY}"
echo "Organization: ${ORGANIZATION}"
echo ""

# Obtener el estado del Quality Gate usando la API de SonarCloud
QUALITY_GATE_URL="https://sonarcloud.io/api/qualitygates/project_status?projectKey=${PROJECT_KEY}"

echo "Consultando: ${QUALITY_GATE_URL}"

RESPONSE=$(curl -s -u "${SONAR_TOKEN}:" "${QUALITY_GATE_URL}" || echo "ERROR")

if [ "$RESPONSE" = "ERROR" ]; then
  echo "❌ Error al consultar Quality Gate"
  echo "Verifica que SONAR_TOKEN esté configurado correctamente"
  exit 1
fi

# Extraer el estado del Quality Gate
STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo "UNKNOWN")

# Intentar parsear JSON si jq está disponible
if command -v jq &> /dev/null; then
  echo ""
  echo "📊 Quality Gate Details:"
  echo "$RESPONSE" | jq '.'
  
  # Extraer condiciones que fallaron
  FAILED_CONDITIONS=$(echo "$RESPONSE" | jq -r '.conditions[] | select(.status == "ERROR") | "  - \(.metricKey): \(.actualValue) (requiere: \(.errorThreshold))"' 2>/dev/null || echo "")
  
  if [ -n "$FAILED_CONDITIONS" ]; then
    echo ""
    echo "❌ Condiciones que fallaron:"
    echo "$FAILED_CONDITIONS"
  fi
else
  echo ""
  echo "Response: $RESPONSE"
fi

echo ""
echo "📊 Quality Gate Status: ${STATUS}"

if [ "$STATUS" = "OK" ]; then
  echo "✅ Quality Gate: PASSED"
  echo "✅ Cobertura de código: >= 70%"
  echo "✅ Sin issues críticos"
  echo "✅ Listo para deploy"
  exit 0
elif [ "$STATUS" = "ERROR" ]; then
  echo "❌ Quality Gate: FAILED"
  echo ""
  echo "El deploy está bloqueado porque:"
  echo "  - Cobertura de código < 70%, O"
  echo "  - Hay issues críticos sin resolver, O"
  echo "  - Hay issues blocker sin resolver"
  echo ""
  echo "Por favor:"
  echo "  1. Revisa el reporte en SonarCloud: https://sonarcloud.io/project/overview?id=${PROJECT_KEY}"
  echo "  2. Corrige los problemas reportados"
  echo "  3. Haz un nuevo push para re-evaluar"
  exit 1
else
  echo "⚠️ Quality Gate Status: ${STATUS}"
  echo "No se pudo determinar el estado. Verifica manualmente en SonarCloud."
  echo "URL: https://sonarcloud.io/project/overview?id=${PROJECT_KEY}"
  # En caso de duda, bloquear el deploy por seguridad
  exit 1
fi

