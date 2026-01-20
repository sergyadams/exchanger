#!/bin/bash

set -e

echo "🚀 Полностью автоматический деплой"
echo ""

# Проверка авторизации GitHub
if ! gh auth status &> /dev/null; then
    echo "🔐 Авторизация в GitHub..."
    echo ""
    echo "Откроется браузер для авторизации."
    echo "Следуйте инструкциям на экране."
    echo ""
    gh auth login --web
    echo ""
    echo "✅ Авторизация завершена"
    echo ""
fi

# Получение username
GITHUB_USER=$(gh api user --jq .login)
REPO_NAME="exchanger"

echo "👤 GitHub пользователь: $GITHUB_USER"
echo ""

# Проверка существования репозитория
if gh repo view "$GITHUB_USER/$REPO_NAME" &> /dev/null; then
    echo "📦 Репозиторий уже существует"
    git remote remove origin 2>/dev/null || true
    git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
else
    echo "📦 Создаю репозиторий..."
    gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
fi

echo ""
echo "✅ Репозиторий готов: https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""

# Проверка что код загружен
if ! git ls-remote --heads origin main &> /dev/null; then
    echo "📤 Загружаю код в GitHub..."
    git branch -M main
    git push -u origin main
    echo "✅ Код загружен"
else
    echo "✅ Код уже в GitHub"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ GitHub репозиторий готов!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Следующие шаги (через веб-интерфейсы):"
echo ""
echo "1️⃣  Frontend (Vercel):"
echo "   https://vercel.com → Add New Project"
echo "   Репозиторий: $GITHUB_USER/$REPO_NAME"
echo "   Root Directory: frontend"
echo ""
echo "2️⃣  Backend (Railway):"
echo "   https://railway.app → New Project → Deploy from GitHub"
echo "   Репозиторий: $GITHUB_USER/$REPO_NAME"
echo "   Root Directory: backend"
echo "   Добавьте PostgreSQL базу данных"
echo ""
echo "3️⃣  После деплоя backend:"
echo "   - Скопируйте URL Railway"
echo "   - Обновите NEXT_PUBLIC_API_URL в Vercel"
echo "   - Выполните миграции в Railway"
echo ""
echo "📖 Подробная инструкция: START_HERE.md"
echo ""
