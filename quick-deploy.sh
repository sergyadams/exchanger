#!/bin/bash

set -e

echo "🚀 Быстрый деплой проекта"
echo ""

# Проверка git
if [ -z "$(git remote -v)" ]; then
    echo "❌ GitHub репозиторий не подключен!"
    echo ""
    echo "Сначала выполните:"
    echo "1. Создайте репозиторий на https://github.com/new"
    echo "2. Затем выполните:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/exchanger.git"
    echo "   git push -u origin main"
    echo ""
    exit 1
fi

echo "✅ Git репозиторий подключен"
echo ""

# Проверка Vercel
if ! command -v vercel &> /dev/null; then
    echo "📦 Устанавливаю Vercel CLI..."
    npm install -g vercel
fi

# Проверка Railway
if ! command -v railway &> /dev/null; then
    echo "📦 Устанавливаю Railway CLI..."
    npm install -g @railway/cli
fi

echo ""
echo "✅ Все инструменты готовы!"
echo ""
echo "Теперь выполните деплой через веб-интерфейсы:"
echo ""
echo "1. Frontend: https://vercel.com → Add Project → выберите репозиторий"
echo "   Root Directory: frontend"
echo ""
echo "2. Backend: https://railway.app → New Project → Deploy from GitHub"
echo "   Root Directory: backend"
echo "   Добавьте PostgreSQL базу данных"
echo ""
echo "Подробная инструкция в файле: SETUP_DEPLOY.md"
