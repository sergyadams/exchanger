#!/bin/bash

set -e

echo "🚀 Начинаю деплой проекта..."

# Проверка зависимостей
if ! command -v vercel &> /dev/null; then
    echo "📦 Устанавливаю Vercel CLI..."
    npm install -g vercel
fi

if ! command -v railway &> /dev/null; then
    echo "📦 Устанавливаю Railway CLI..."
    npm install -g @railway/cli
fi

# Проверка git
if [ ! -d ".git" ]; then
    echo "📦 Инициализирую git..."
    git init
    git add .
    git commit -m "Initial commit"
fi

echo ""
echo "✅ Готово к деплою!"
echo ""
echo "Следующие шаги:"
echo ""
echo "1. Создайте GitHub репозиторий:"
echo "   - Зайдите на https://github.com/new"
echo "   - Создайте новый репозиторий (например: exchanger)"
echo "   - НЕ добавляйте README, .gitignore или лицензию"
echo ""
echo "2. Подключите репозиторий:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/exchanger.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Деплой Frontend (Vercel):"
echo "   cd frontend"
echo "   vercel"
echo "   (следуйте инструкциям, выберите 'frontend' как root directory)"
echo ""
echo "4. Деплой Backend (Railway):"
echo "   railway login"
echo "   railway init"
echo "   railway up"
echo ""
echo "5. После деплоя backend:"
echo "   - Скопируйте URL (например: https://xxx.up.railway.app)"
echo "   - Обновите NEXT_PUBLIC_API_URL в Vercel"
echo "   - Выполните миграции: railway run npx prisma migrate deploy"
