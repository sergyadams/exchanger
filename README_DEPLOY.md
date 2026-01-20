# Быстрый деплой

## Вариант 1: Vercel + Railway (Рекомендуется)

### Frontend (Vercel)
1. Зайдите на https://vercel.com
2. Войдите через GitHub
3. Нажмите "Add New Project"
4. Выберите репозиторий
5. Настройки:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/.next`
6. Environment Variables:
   - `NEXT_PUBLIC_API_URL` = (заполните после деплоя backend)

### Backend (Railway)
1. Зайдите на https://railway.app
2. Войдите через GitHub
3. New Project → Deploy from GitHub repo
4. Выберите репозиторий
5. Добавьте PostgreSQL:
   - New → Database → PostgreSQL
6. Настройте сервис:
   - Root Directory: `backend`
   - Build Command: `cd backend && npm run build`
   - Start Command: `cd backend && npm start`
7. Environment Variables:
   - `DATABASE_URL` = (автоматически из PostgreSQL)
   - `PORT` = 3001
   - `NODE_ENV` = production
8. После деплоя скопируйте URL (например: `https://your-project.up.railway.app`)
9. Обновите `NEXT_PUBLIC_API_URL` в Vercel на этот URL

### Миграции
После деплоя backend выполните:
```bash
railway run cd backend && npx prisma migrate deploy
railway run cd backend && npx prisma db seed
```

Или через Railway Dashboard → Deployments → Run Command

## Вариант 2: Vercel + Render

### Backend (Render)
1. Зайдите на https://render.com
2. New → Web Service
3. Подключите GitHub репозиторий
4. Настройки:
   - Root Directory: `backend`
   - Build Command: `cd backend && npm run build`
   - Start Command: `cd backend && npm start`
5. Добавьте PostgreSQL:
   - New → PostgreSQL
6. Environment Variables:
   - `DATABASE_URL` = (из Render PostgreSQL)
   - `PORT` = 10000
   - `NODE_ENV` = production

## Проверка

1. Frontend должен быть доступен по HTTPS URL от Vercel
2. Backend должен отвечать на `/health` endpoint
3. Проверьте что API работает через Network tab в браузере

## Важно

- SQLite не работает в продакшене, нужен PostgreSQL
- После деплоя backend обновите `NEXT_PUBLIC_API_URL` в Vercel
- Выполните миграции базы данных после первого деплоя
