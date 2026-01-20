#!/bin/bash

# Создание репозитория через GitHub API с токеном

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Требуется GitHub токен"
    echo ""
    echo "Создайте токен здесь: https://github.com/settings/tokens"
    echo "Права: repo (полный доступ к репозиториям)"
    echo ""
    echo "Затем выполните:"
    echo "export GITHUB_TOKEN=your_token_here"
    echo "./create-repo-with-token.sh"
    exit 1
fi

REPO_NAME="exchanger"
GITHUB_USER=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | grep -o '"login":"[^"]*' | cut -d'"' -f4)

if [ -z "$GITHUB_USER" ]; then
    echo "❌ Не удалось получить username. Проверьте токен."
    exit 1
fi

echo "👤 GitHub пользователь: $GITHUB_USER"
echo "📦 Создаю репозиторий $REPO_NAME..."

# Создание репозитория
RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"public\":true}")

if echo "$RESPONSE" | grep -q '"id"'; then
    echo "✅ Репозиторий создан!"
    echo ""
    
    # Подключение remote
    git remote remove origin 2>/dev/null || true
    git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
    git branch -M main
    
    echo "📤 Загружаю код..."
    git push -u origin main
    
    echo ""
    echo "✅ Готово! Репозиторий: https://github.com/$GITHUB_USER/$REPO_NAME"
else
    echo "❌ Ошибка создания репозитория:"
    echo "$RESPONSE" | grep -o '"message":"[^"]*' | head -1
    exit 1
fi
