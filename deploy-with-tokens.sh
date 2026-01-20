#!/bin/bash

# Полностью автоматический деплой с токенами
# Использование: export VERCEL_TOKEN=... RAILWAY_TOKEN=... && ./deploy-with-tokens.sh

set -e

if [ -z "$VERCEL_TOKEN" ] || [ -z "$RAILWAY_TOKEN" ]; then
    echo "❌ Требуются токены!"
    echo ""
    echo "Получите токены:"
    echo "  Vercel: https://vercel.com/account/tokens"
    echo "  Railway: https://railway.app/account/tokens"
    echo ""
    echo "Затем выполните:"
    echo "  export VERCEL_TOKEN=ваш_токен"
    echo "  export RAILWAY_TOKEN=ваш_токен"
    echo "  ./deploy-with-tokens.sh"
    exit 1
fi

echo "🚀 ПОЛНОСТЬЮ АВТОМАТИЧЕСКИЙ ДЕПЛОЙ"
echo ""

# Frontend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  FRONTEND (Vercel)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd frontend

echo "🔑 Использую токен для деплоя..."
export VERCEL_TOKEN="$VERCEL_TOKEN"

echo "📤 Деплой..."
vercel --prod --yes --token "$VERCEL_TOKEN" 2>&1 | tee /tmp/vercel.log

FRONTEND_URL=$(grep -o 'https://[^ ]*\.vercel\.app' /tmp/vercel.log | head -1 || vercel ls --token "$VERCEL_TOKEN" --json 2>/dev/null | python3 -c "import sys, json; d=json.load(sys.stdin); print(d[0]['url'] if isinstance(d, list) and len(d) > 0 else '')" 2>/dev/null || echo "")
echo "✅ Frontend: $FRONTEND_URL"

cd ..

# Backend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  BACKEND (Railway)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd backend

echo "🔑 Использую токен для Railway..."
export RAILWAY_TOKEN="$RAILWAY_TOKEN"

echo "📦 Создание проекта..."
railway init --name exchanger-backend || true

echo "📤 Деплой..."
railway up --detach

echo "⏳ Ожидание деплоя..."
sleep 20

echo "📊 Настройка переменных..."
railway variables set PORT=3001 NODE_ENV=production || true

echo "🗄️  Добавление PostgreSQL..."
railway add postgresql || true

sleep 10

echo "🔄 Миграции..."
railway run npx prisma migrate deploy || true

echo "🌱 Seed..."
railway run npx prisma db seed || true

BACKEND_URL=$(railway domain 2>/dev/null || railway status | grep -o 'https://[^ ]*' | head -1 || echo "")
echo "✅ Backend: $BACKEND_URL"

cd ..

# Обновление frontend
if [ -n "$BACKEND_URL" ]; then
    echo ""
    echo "🔧 Обновление frontend с API URL..."
    cd frontend
    echo "$BACKEND_URL" | vercel env add NEXT_PUBLIC_API_URL production --token "$VERCEL_TOKEN" || \
    (vercel env rm NEXT_PUBLIC_API_URL production --token "$VERCEL_TOKEN" --yes 2>/dev/null; \
     echo "$BACKEND_URL" | vercel env add NEXT_PUBLIC_API_URL production --token "$VERCEL_TOKEN")
    
    echo "🔄 Передеплой frontend..."
    vercel --prod --yes --token "$VERCEL_TOKEN"
    cd ..
fi

echo ""
echo "✅✅✅ ГОТОВО! ✅✅✅"
echo ""
echo "📍 Frontend: $FRONTEND_URL"
echo "📍 Backend: $BACKEND_URL"
echo ""
echo "🌐 Сайт доступен: $FRONTEND_URL"
