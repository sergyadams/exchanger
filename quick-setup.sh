#!/bin/bash

set -e

echo "🚀 Быстрая настройка деплоя"
echo ""

# Шаг 1: Авторизация GitHub
if ! gh auth status &> /dev/null; then
    echo "📝 ШАГ 1: Авторизация в GitHub"
    echo ""
    echo "Выполните вручную:"
    echo "  gh auth login"
    echo ""
    echo "Или используйте токен:"
    echo "  export GH_TOKEN=your_token_here"
    echo ""
    read -p "Нажмите Enter после авторизации..."
    
    if ! gh auth status &> /dev/null; then
        echo "❌ Авторизация не завершена"
        exit 1
    fi
fi

echo "✅ GitHub авторизован"
echo ""

# Шаг 2: Создание репозитория
REPO_NAME="exchanger"
GITHUB_USER=$(gh api user --jq .login)

echo "📦 Создаю репозиторий: $REPO_NAME"
echo ""

if gh repo view $GITHUB_USER/$REPO_NAME &> /dev/null; then
    echo "⚠️  Репозиторий уже существует"
    git remote remove origin 2>/dev/null || true
    git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git
else
    gh repo create $REPO_NAME --public --source=. --remote=origin --push
    echo "✅ Репозиторий создан"
fi

# Push
echo ""
echo "📤 Загружаю код..."
git branch -M main 2>/dev/null || true
git push -u origin main 2>&1 | tail -5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ GitHub репозиторий готов!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 URL: https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
echo "📋 Теперь задеплойте:"
echo ""
echo "1. Frontend: https://vercel.com → Add Project → exchanger"
echo "   Root Directory: frontend"
echo ""
echo "2. Backend: https://railway.app → New Project → exchanger"
echo "   Root Directory: backend"
echo ""
echo "Подробнее: DEPLOY_NOW.md"
