#!/bin/bash

# ФИНАЛЬНЫЙ АВТОМАТИЧЕСКИЙ ДЕПЛОЙ
# Выполняет ВСЕ шаги автоматически

set -e

GITHUB_TOKEN="${GITHUB_TOKEN:-}"
REPO_NAME="exchanger"
GITHUB_USER="sergyadams"

echo "🚀 ПОЛНЫЙ АВТОМАТИЧЕСКИЙ ДЕПЛОЙ"
echo ""

# Шаг 1: Проверяем/создаем репозиторий
echo "1️⃣  Проверяю репозиторий..."
REPO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/$GITHUB_USER/$REPO_NAME)

if [ "$REPO_STATUS" = "404" ]; then
    echo "   ⚠️  Репозиторий не найден"
    echo "   📝 Создаю через API..."
    
    CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Content-Type: application/json" \
        https://api.github.com/user/repos \
        -d "{\"name\":\"$REPO_NAME\",\"private\":false,\"auto_init\":false}")
    
    HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -1)
    
    if [ "$HTTP_CODE" = "201" ]; then
        echo "   ✅ Репозиторий создан!"
    elif [ "$HTTP_CODE" = "422" ]; then
        echo "   ℹ️  Репозиторий уже существует"
    else
        echo "   ❌ Не удалось создать (HTTP $HTTP_CODE)"
        echo "   💡 Создайте вручную: https://github.com/new"
        echo "      Название: $REPO_NAME, Public, БЕЗ файлов"
        echo ""
        read -p "   Нажмите Enter после создания..."
    fi
else
    echo "   ✅ Репозиторий существует"
fi

# Шаг 2: Настраиваем git
echo ""
echo "2️⃣  Настраиваю git..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git"
git branch -M main

# Шаг 3: Загружаем код
echo ""
echo "3️⃣  Загружаю код..."
if git push -u origin main 2>&1; then
    echo ""
    echo "✅✅✅ ГОТОВО! ✅✅✅"
    echo ""
    echo "📍 Репозиторий: https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
    echo "📋 СЛЕДУЮЩИЕ ШАГИ:"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  FRONTEND (Vercel)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  1. https://vercel.com/new"
    echo "  2. Import Git Repository → $REPO_NAME"
    echo "  3. Root Directory: frontend"
    echo "  4. Framework: Next.js"
    echo "  5. Deploy"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  BACKEND (Railway)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  1. https://railway.app/new"
    echo "  2. Deploy from GitHub → $REPO_NAME"
    echo "  3. Root Directory: backend"
    echo "  4. Add PostgreSQL"
    echo "  5. Variables:"
    echo "     PORT=3001"
    echo "     NODE_ENV=production"
    echo "     DATABASE_URL=<из PostgreSQL>"
    echo "  6. Deploy"
    echo ""
else
    echo ""
    echo "❌ Ошибка загрузки"
    echo "   Проверьте права токена или создайте репозиторий вручную"
    exit 1
fi
