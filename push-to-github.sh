#!/bin/bash

# Скрипт для загрузки кода в GitHub
# Используйте после создания репозитория вручную

REPO_URL="https://github.com/sergyadams/exchanger.git"

echo "📤 Загружаю код в GitHub..."

# Удаляем старый remote если есть
git remote remove origin 2>/dev/null

# Добавляем новый remote
git remote add origin "$REPO_URL"

# Переименовываем ветку в main
git branch -M main

# Загружаем код
echo "⏳ Загрузка..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Готово! Репозиторий: $REPO_URL"
    echo ""
    echo "📋 Следующие шаги:"
    echo "   1. Frontend: https://vercel.com → Add Project → выберите репозиторий → Root: frontend"
    echo "   2. Backend: https://railway.app → New Project → Deploy from GitHub → Root: backend"
else
    echo ""
    echo "❌ Ошибка. Убедитесь что:"
    echo "   - Репозиторий создан: https://github.com/new"
    echo "   - Название: exchanger"
    echo "   - Public"
    echo "   - БЕЗ README, .gitignore, license"
fi
