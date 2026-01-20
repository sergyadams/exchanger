# 🚀 ДЕПЛОЙ ЧЕРЕЗ ВЕБ-ИНТЕРФЕЙСЫ

## ✅ Frontend (Vercel)

1. Откройте: https://vercel.com/new
2. Войдите через GitHub
3. Import Git Repository → выберите `exchanger`
4. Настройки проекта:
   - **Framework Preset:** Next.js (автоматически)
   - **Root Directory:** `frontend` ⚠️ ВАЖНО!
   - **Build Command:** (оставить по умолчанию)
   - **Output Directory:** `.next`
5. Environment Variables (добавить ПОСЛЕ деплоя backend):
   - `NEXT_PUBLIC_API_URL` = `<url_вашего_railway_backend>`
6. Нажмите **Deploy**

## ✅ Backend (Railway)

1. Откройте: https://railway.app/new
2. Войдите через GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Выберите репозиторий `exchanger`
5. В настройках проекта:
   - **Root Directory:** `backend` ⚠️ ВАЖНО!
6. Добавьте PostgreSQL:
   - Нажмите **New** → **Database** → **PostgreSQL**
7. Переменные окружения:
   - `PORT` = `3001`
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (автоматически из PostgreSQL)
8. После деплоя:
   - Скопируйте URL (например: `https://exchanger-production.up.railway.app`)
   - Выполните миграции (Railway → Deployments → Run Command):
     ```
     cd backend && npx prisma migrate deploy
     ```
   - Заполните базу (Run Command):
     ```
     cd backend && npx prisma db seed
     ```

## 🔗 Связывание Frontend и Backend

После деплоя backend:
1. Откройте Vercel Dashboard
2. Ваш проект → **Settings** → **Environment Variables**
3. Добавьте:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `<ваш_railway_url>` (например: `https://exchanger-production.up.railway.app`)
   - Environment: `Production`
4. Сохраните и передеплойте (Settings → Redeploy)

## ✅ Готово!

Сайт будет доступен по адресу от Vercel (например: `https://exchanger.vercel.app`)
