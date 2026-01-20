#!/bin/bash

# Упрощенный автоматический деплой
# Использует CLI с интерактивной авторизацией

set -e

echo "🚀 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ"
echo ""
echo "Этот скрипт автоматически:"
echo "  1. Установит Vercel и Railway CLI (если нужно)"
echo "  2. Задеплоит frontend на Vercel"
echo "  3. Задеплоит backend на Railway"
echo "  4. Настроит переменные окружения"
echo "  5. Выполнит миграции БД"
echo ""
read -p "Нажмите Enter для продолжения..."

# Установка CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Устанавливаю Vercel CLI..."
    npm install -g vercel
fi

if ! command -v railway &> /dev/null; then
    echo "📦 Устанавливаю Railway CLI..."
    npm install -g @railway/cli
fi

# Frontend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  FRONTEND (Vercel)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd frontend

echo "🔐 Авторизация в Vercel..."
vercel login

echo "📤 Деплой..."
vercel --prod --yes

FRONTEND_URL=$(vercel ls --json | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['url'])" 2>/dev/null || echo "")
echo "✅ Frontend: $FRONTEND_URL"

cd ..

# Backend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  BACKEND (Railway)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd backend

echo "🔐 Авторизация в Railway..."
railway login

echo "📦 Создание проекта..."
railway init --name exchanger-backend || true

echo "📤 Деплой..."
railway up --detach

echo "⏳ Ожидание деплоя..."
sleep 15

echo "📊 Настройка переменных..."
railway variables set PORT=3001 NODE_ENV=production

echo "🗄️  Добавление PostgreSQL..."
railway add postgresql || true

sleep 5

echo "🔄 Миграции..."
railway run npx prisma migrate deploy || true

echo "🌱 Seed..."
railway run npx prisma db seed || true

BACKEND_URL=$(railway domain 2>/dev/null || echo "")
echo "✅ Backend: $BACKEND_URL"

cd ..

# Обновление frontend
if [ -n "$BACKEND_URL" ]; then
    echo ""
    echo "🔧 Обновление frontend с API URL..."
    cd frontend
    vercel env add NEXT_PUBLIC_API_URL production <<< "$BACKEND_URL" || true
    vercel --prod --yes
    cd ..
fi

echo ""
echo "✅✅✅ ГОТОВО!"
echo "📍 Frontend: $FRONTEND_URL"
echo "📍 Backend: $BACKEND_URL"
