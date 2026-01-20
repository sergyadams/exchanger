#!/bin/bash

set -e

echo "🚀 Автоматический деплой проекта"
echo ""

# Проверка авторизации GitHub
if ! gh auth status &> /dev/null; then
    echo "🔐 Авторизация в GitHub..."
    echo ""
    echo "Откроется браузер для авторизации"
    echo "Или используйте код из вывода выше"
    echo ""
    gh auth login --web
    echo ""
    echo "✅ Авторизация завершена"
fi

echo "📦 Создаю GitHub репозиторий..."
REPO_NAME="exchanger"

# Проверка существования репозитория
if gh repo view $REPO_NAME &> /dev/null; then
    echo "⚠️  Репозиторий уже существует, подключаю..."
    git remote remove origin 2>/dev/null || true
    git remote add origin https://github.com/$(gh api user --jq .login)/$REPO_NAME.git
else
    echo "✅ Создаю новый репозиторий..."
    gh repo create $REPO_NAME --public --source=. --remote=origin --push
fi

echo ""
echo "✅ Репозиторий готов: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
echo ""

# Push если еще не запушено
if ! git ls-remote --heads origin main &> /dev/null; then
    echo "📤 Загружаю код в GitHub..."
    git branch -M main
    git push -u origin main
else
    echo "✅ Код уже загружен"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ GitHub репозиторий готов!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Теперь задеплойте через веб-интерфейсы:"
echo ""
echo "1️⃣  FRONTEND (Vercel):"
echo "   → https://vercel.com"
echo "   → Add New Project"
echo "   → Выберите репозиторий: exchanger"
echo "   → Root Directory: frontend ⚠️"
echo "   → Deploy"
echo ""
echo "2️⃣  BACKEND (Railway):"
echo "   → https://railway.app"
echo "   → New Project → Deploy from GitHub"
echo "   → Выберите: exchanger"
echo "   → Root Directory: backend"
echo "   → Добавьте PostgreSQL"
echo "   → Variables: PORT=3001, NODE_ENV=production"
echo ""
echo "3️⃣  После деплоя backend:"
echo "   → Выполните миграции (Railway → Deployments → Run Command)"
echo "   → Обновите NEXT_PUBLIC_API_URL в Vercel"
echo ""
echo "📖 Подробная инструкция: DEPLOY_NOW.md"
echo ""
