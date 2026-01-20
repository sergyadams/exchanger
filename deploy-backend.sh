#!/bin/bash
set -e

echo "🚀 Автоматический деплой backend"
echo ""

# Проверка Railway CLI
if command -v railway &> /dev/null; then
    echo "✅ Railway CLI найден"
    
    # Попытка деплоя через Railway CLI
    if [ -n "$RAILWAY_TOKEN" ]; then
        export RAILWAY_TOKEN="$RAILWAY_TOKEN"
        echo "🔑 Используется RAILWAY_TOKEN"
        
        cd backend
        railway up --detach
        echo "✅ Backend задеплоен на Railway"
        exit 0
    else
        echo "⚠️  RAILWAY_TOKEN не установлен"
        echo "   Установите: export RAILWAY_TOKEN='your-token'"
    fi
else
    echo "⚠️  Railway CLI не найден"
    echo "   Установите: npm i -g @railway/cli"
fi

echo ""
echo "📋 Альтернатива: Используйте Railway/Render UI:"
echo "   1. Railway: https://railway.app/new"
echo "   2. Render: https://dashboard.render.com/new"
echo ""
echo "После деплоя установите NEXT_PUBLIC_API_URL на Vercel"
