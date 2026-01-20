# Инструкция по деплою

## Frontend (Vercel)

1. Зарегистрируйтесь на [Vercel](https://vercel.com)
2. Подключите GitHub репозиторий
3. Настройки проекта:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Environment Variables:
   - `NEXT_PUBLIC_API_URL` = URL вашего backend (после деплоя backend)

## Backend (Railway)

1. Зарегистрируйтесь на [Railway](https://railway.app)
2. Создайте новый проект
3. Добавьте PostgreSQL базу данных
4. Подключите GitHub репозиторий
5. Настройки:
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
6. Environment Variables:
   - `DATABASE_URL` = PostgreSQL connection string (автоматически из Railway)
   - `PORT` = 3001 (или любой другой)
   - `NODE_ENV` = production

7. После деплоя получите URL (например: `https://your-project.up.railway.app`)
8. Обновите `NEXT_PUBLIC_API_URL` в Vercel на этот URL

## Альтернатива: Render

### Backend на Render:
1. Зарегистрируйтесь на [Render](https://render.com)
2. Создайте новый Web Service
3. Подключите GitHub репозиторий
4. Настройки:
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
5. Добавьте PostgreSQL базу данных
6. Environment Variables:
   - `DATABASE_URL` = из Render PostgreSQL
   - `PORT` = 10000 (или из Render)

## Миграция базы данных

После деплоя backend выполните миграции:

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

Или через Railway CLI:
```bash
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

## Проверка

1. Frontend должен быть доступен по HTTPS URL от Vercel
2. Backend должен отвечать на `/health` endpoint
3. Проверьте что API работает через Network tab в браузере
