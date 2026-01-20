#!/bin/bash
set -e

# Скрипт для автоматической установки NEXT_PUBLIC_API_URL на Vercel

VERCEL_TOKEN="${VERCEL_TOKEN:-vIWDhvpym91qRlMf9uGBFVn9}"
PROJECT_ID="${PROJECT_ID:-prj_YBzwmS6wxXAVo5aD6cdU801x3wHP}"

if [ -z "$1" ]; then
  echo "❌ Ошибка: Укажите URL backend"
  echo ""
  echo "Использование:"
  echo "  ./set-vercel-api-url.sh https://your-backend-url.com"
  echo ""
  echo "Примеры:"
  echo "  ./set-vercel-api-url.sh https://exchanger-backend.up.railway.app"
  echo "  ./set-vercel-api-url.sh https://exchanger-backend.onrender.com"
  exit 1
fi

BACKEND_URL="$1"

echo "🔧 Устанавливаю NEXT_PUBLIC_API_URL=$BACKEND_URL на Vercel..."

# Проверка доступности backend
echo -n "  Проверяю доступность backend... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$BACKEND_URL/health" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Backend доступен!"
else
  echo "⚠️  Backend не отвечает (HTTP $HTTP_CODE), но продолжаю..."
fi

# Установка переменной окружения
RESPONSE=$(curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"key\": \"NEXT_PUBLIC_API_URL\",
    \"value\": \"$BACKEND_URL\",
    \"type\": \"encrypted\",
    \"target\": [\"production\", \"preview\", \"development\"]
  }")

if echo "$RESPONSE" | grep -q '"id"'; then
  echo "✅ Переменная окружения установлена!"
  echo ""
  echo "🔄 Перезапускаю деплой на Vercel..."
  
  # Перезапуск деплоя через push
  git commit --allow-empty -m "Trigger redeploy after setting API URL" && git push
  
  echo "✅ Деплой перезапущен! Подождите 2-3 минуты..."
else
  echo "❌ Ошибка установки переменной:"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
  exit 1
fi
