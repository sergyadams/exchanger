#!/bin/bash

# Полностью автоматический деплой
# Требуется: токен с правами repo (для создания репозитория)

set -e

GITHUB_TOKEN="${GITHUB_TOKEN:-}"
REPO_NAME="exchanger"

echo "🚀 Начинаю автоматический деплой..."

# 1. Получаем username
echo "📋 Получаю информацию о пользователе..."
GITHUB_USER=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | python3 -c "import sys, json; print(json.load(sys.stdin)['login'])")
echo "✅ Пользователь: $GITHUB_USER"

# 2. Проверяем существование репозитория
echo "🔍 Проверяю репозиторий..."
REPO_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/$GITHUB_USER/$REPO_NAME)

if [ "$REPO_EXISTS" = "200" ]; then
    echo "✅ Репозиторий уже существует"
else
    echo "⚠️  Репозиторий не найден. Токен не имеет прав на создание."
    echo "📝 Создайте репозиторий вручную: https://github.com/new"
    echo "   - Название: $REPO_NAME"
    echo "   - Public"
    echo "   - БЕЗ README, .gitignore, license"
    echo ""
    read -p "Нажмите Enter после создания репозитория..."
fi

# 3. Настраиваем git
echo "⚙️  Настраиваю git..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git"
git branch -M main

# 4. Загружаем код
echo "📤 Загружаю код..."
if git push -u origin main 2>&1; then
    echo ""
    echo "✅ Код загружен!"
    echo "📍 Репозиторий: https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
    echo "📋 Следующие шаги:"
    echo ""
    echo "1️⃣  FRONTEND (Vercel):"
    echo "   - Откройте: https://vercel.com/new"
    echo "   - Import Git Repository → выберите $REPO_NAME"
    echo "   - Root Directory: frontend"
    echo "   - Framework Preset: Next.js"
    echo "   - Deploy"
    echo ""
    echo "2️⃣  BACKEND (Railway):"
    echo "   - Откройте: https://railway.app/new"
    echo "   - Deploy from GitHub repo → выберите $REPO_NAME"
    echo "   - Root Directory: backend"
    echo "   - Add PostgreSQL"
    echo "   - Variables:"
    echo "     PORT=3001"
    echo "     NODE_ENV=production"
    echo "     DATABASE_URL=<из PostgreSQL>"
    echo "   - Deploy"
    echo ""
else
    echo ""
    echo "❌ Ошибка загрузки. Проверьте:"
    echo "   - Репозиторий создан: https://github.com/$GITHUB_USER/$REPO_NAME"
    echo "   - Токен имеет права на запись"
    exit 1
fi
