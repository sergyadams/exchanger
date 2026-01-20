#!/bin/bash

set -e

echo "🚀 Автоматический деплой"
echo ""

# Проверка GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "📦 Устанавливаю GitHub CLI..."
    brew install gh
    echo "⚠️  Выполните: gh auth login"
    exit 1
fi

# Проверка авторизации GitHub
if ! gh auth status &> /dev/null; then
    echo "🔐 Авторизуйтесь в GitHub:"
    gh auth login
fi

echo "✅ GitHub авторизован"
echo ""

# Создание репозитория
echo "📦 Создаю GitHub репозиторий..."
REPO_NAME="exchanger"
gh repo create $REPO_NAME --public --source=. --remote=origin --push

echo ""
echo "✅ Репозиторий создан: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
echo ""
echo "Теперь задеплойте через веб-интерфейсы:"
echo ""
echo "1. Frontend: https://vercel.com → Add Project → выберите репозиторий"
echo "   Root Directory: frontend"
echo ""
echo "2. Backend: https://railway.app → New Project → Deploy from GitHub"
echo "   Root Directory: backend"
echo ""
echo "Подробная инструкция: START_HERE.md"
