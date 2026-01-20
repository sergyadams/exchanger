#!/bin/bash

# Полностью автоматический деплой на Vercel и Railway
# Требуется: VERCEL_TOKEN и RAILWAY_TOKEN (или авторизация через CLI)

set -e

echo "🚀 ПОЛНЫЙ АВТОМАТИЧЕСКИЙ ДЕПЛОЙ"
echo ""

# Проверка зависимостей
if ! command -v vercel &> /dev/null; then
    echo "📦 Устанавливаю Vercel CLI..."
    npm install -g vercel
fi

if ! command -v railway &> /dev/null; then
    echo "📦 Устанавливаю Railway CLI..."
    npm install -g @railway/cli
fi

# Проверка токенов
VERCEL_TOKEN="${VERCEL_TOKEN:-}"
RAILWAY_TOKEN="${RAILWAY_TOKEN:-}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ШАГ 1: FRONTEND (Vercel)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd frontend

if [ -n "$VERCEL_TOKEN" ]; then
    echo "🔑 Использую токен для авторизации..."
    echo "$VERCEL_TOKEN" | vercel login --token
else
    echo "🔐 Авторизация в Vercel..."
    echo "   (Если потребуется, откройте браузер для авторизации)"
    vercel login
fi

echo ""
echo "📤 Деплою frontend..."
vercel --prod --yes --cwd . 2>&1 | tee /tmp/vercel-deploy.log

# Получаем URL из вывода
FRONTEND_URL=$(grep -o 'https://[^ ]*\.vercel\.app' /tmp/vercel-deploy.log | head -1 || echo "")
echo ""
echo "✅ Frontend задеплоен: $FRONTEND_URL"

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ШАГ 2: BACKEND (Railway)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd backend

if [ -n "$RAILWAY_TOKEN" ]; then
    echo "🔑 Использую токен для авторизации..."
    railway login --token "$RAILWAY_TOKEN"
else
    echo "🔐 Авторизация в Railway..."
    echo "   (Если потребуется, откройте браузер для авторизации)"
    railway login
fi

echo ""
echo "📦 Создаю проект Railway..."
railway init --name exchanger-backend || echo "Проект уже существует"

echo ""
echo "📤 Деплою backend..."
railway up --detach

echo ""
echo "⏳ Жду деплой..."
sleep 10

# Получаем URL
BACKEND_URL=$(railway domain 2>/dev/null || railway status | grep -o 'https://[^ ]*' | head -1 || echo "")
echo ""
echo "✅ Backend задеплоен: $BACKEND_URL"

echo ""
echo "📊 Добавляю переменные окружения..."
railway variables set PORT=3001 NODE_ENV=production || true

echo ""
echo "🗄️  Добавляю PostgreSQL..."
railway add postgresql || echo "PostgreSQL уже добавлен"

# Ждем подключения БД
sleep 5

# Получаем DATABASE_URL
DATABASE_URL=$(railway variables get DATABASE_URL 2>/dev/null || echo "")
if [ -n "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL получен"
    railway variables set DATABASE_URL="$DATABASE_URL"
fi

echo ""
echo "🔄 Выполняю миграции..."
railway run npx prisma migrate deploy || echo "Миграции уже выполнены"

echo ""
echo "🌱 Заполняю базу данных..."
railway run npx prisma db seed || echo "Seed уже выполнен"

cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ШАГ 3: ОБНОВЛЕНИЕ FRONTEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -n "$BACKEND_URL" ]; then
    cd frontend
    echo "🔧 Обновляю NEXT_PUBLIC_API_URL..."
    vercel env add NEXT_PUBLIC_API_URL production <<< "$BACKEND_URL" || \
    vercel env rm NEXT_PUBLIC_API_URL production --yes && \
    vercel env add NEXT_PUBLIC_API_URL production <<< "$BACKEND_URL"
    
    echo ""
    echo "🔄 Передеплою frontend с новым API URL..."
    vercel --prod --yes
    cd ..
fi

echo ""
echo "✅✅✅ ВСЁ ГОТОВО! ✅✅✅"
echo ""
echo "📍 Frontend: $FRONTEND_URL"
echo "📍 Backend: $BACKEND_URL"
echo ""
echo "🌐 Сайт доступен по адресу: $FRONTEND_URL"
