#!/bin/bash

# Создание репозитория и загрузка кода
# Использует токен для всех операций

GITHUB_TOKEN="${GITHUB_TOKEN:-}"
REPO_NAME="exchanger"

echo "🚀 Автоматическое создание и загрузка..."

# Получаем username
GITHUB_USER=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | python3 -c "import sys, json; print(json.load(sys.stdin)['login'])")
echo "👤 Пользователь: $GITHUB_USER"

# Пробуем создать репозиторий
echo "📦 Создаю репозиторий..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"private\":false}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "422" ]; then
    if [ "$HTTP_CODE" = "422" ]; then
        echo "ℹ️  Репозиторий уже существует или имя занято"
    else
        echo "✅ Репозиторий создан!"
    fi
    
    # Настраиваем git и загружаем
    echo "⚙️  Настраиваю git..."
    git remote remove origin 2>/dev/null || true
    git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git"
    git branch -M main
    
    echo "📤 Загружаю код..."
    if git push -u origin main 2>&1; then
        echo ""
        echo "✅ ГОТОВО!"
        echo "📍 https://github.com/$GITHUB_USER/$REPO_NAME"
    else
        echo "❌ Ошибка загрузки. Проверьте права токена."
    fi
else
    echo "❌ Ошибка создания репозитория (HTTP $HTTP_CODE)"
    echo "$BODY" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('message', 'Unknown error'))" 2>/dev/null || echo "$BODY"
    echo ""
    echo "💡 Создайте репозиторий вручную: https://github.com/new"
    echo "   Затем выполните: git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git && git push -u origin main"
fi
