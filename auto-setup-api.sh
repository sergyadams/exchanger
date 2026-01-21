#!/bin/bash
set -e

VERCEL_TOKEN="${VERCEL_TOKEN:-vIWDhvpym91qRlMf9uGBFVn9}"
PROJECT_ID="${PROJECT_ID:-prj_YBzwmS6wxXAVo5aD6cdU801x3wHP}"

echo "🔍 Автоматический поиск backend URL..."

# Список возможных URL для проверки
POSSIBLE_URLS=(
  "https://exchanger-production.up.railway.app"
  "https://exchanger-backend.up.railway.app"
  "https://exchanger.up.railway.app"
  "https://exchanger-backend.onrender.com"
  "https://exchanger.onrender.com"
  "https://exchanger-backend.render.com"
)

FOUND_URL=""

# Проверка каждого URL
for url in "${POSSIBLE_URLS[@]}"; do
  echo -n "  Проверяю $url ... "
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url/health" 2>/dev/null || echo "000")
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ РАБОТАЕТ!"
    FOUND_URL="$url"
    break
  else
    echo "❌ (HTTP $HTTP_CODE)"
  fi
done

if [ -z "$FOUND_URL" ]; then
  echo ""
  echo "❌ Backend URL не найден автоматически"
  echo ""
  echo "💡 Введите URL backend вручную (например: https://exchanger-backend.up.railway.app):"
  read -r FOUND_URL
fi

if [ -z "$FOUND_URL" ]; then
  echo "❌ URL не указан. Выход."
  exit 1
fi

echo ""
echo "✅ Найден backend URL: $FOUND_URL"
echo ""
echo "🔧 Устанавливаю переменную окружения на Vercel..."

# Установка переменной окружения на Vercel
RESPONSE=$(curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"key\": \"NEXT_PUBLIC_API_URL\",
    \"value\": \"$FOUND_URL\",
    \"type\": \"encrypted\",
    \"target\": [\"production\", \"preview\", \"development\"]
  }")

if echo "$RESPONSE" | grep -q '"id"'; then
  echo "✅ Переменная окружения установлена!"
  echo ""
  echo "🔄 Перезапускаю деплой на Vercel..."
  
  # Перезапуск деплоя
  curl -s -X POST "https://api.vercel.com/v13/deployments" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"exchanger\",
      \"project\": \"$PROJECT_ID\",
      \"target\": \"production\"
    }" > /dev/null
  
  echo "✅ Деплой перезапущен! Подождите 2-3 минуты..."
else
  echo "❌ Ошибка установки переменной:"
  echo "$RESPONSE"
  exit 1
fi
