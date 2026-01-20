# Автоматический деплой

## Что нужно от вас:

### 1. GitHub репозиторий
- Зайдите на https://github.com/new
- Создайте репозиторий (например: `exchanger`)
- НЕ добавляйте README, .gitignore или лицензию
- Скопируйте URL репозитория

### 2. Vercel аккаунт
- Зайдите на https://vercel.com
- Войдите через GitHub

### 3. Railway аккаунт  
- Зайдите на https://railway.app
- Войдите через GitHub

---

## После этого выполните:

```bash
# 1. Подключите GitHub репозиторий
git remote add origin https://github.com/YOUR_USERNAME/exchanger.git
git branch -M main
git push -u origin main

# 2. Деплой Frontend
cd frontend
npx vercel

# 3. Деплой Backend  
cd ../backend
npx railway login
npx railway init
npx railway up

# 4. Добавьте PostgreSQL в Railway
# (через Railway Dashboard: New → Database → PostgreSQL)

# 5. Обновите переменные окружения в Railway:
# DATABASE_URL = (автоматически из PostgreSQL)
# PORT = 3001
# NODE_ENV = production

# 6. Выполните миграции
npx railway run npx prisma migrate deploy
npx railway run npx prisma db seed

# 7. Скопируйте URL backend (например: https://xxx.up.railway.app)

# 8. Обновите NEXT_PUBLIC_API_URL в Vercel:
# Зайдите в Vercel Dashboard → Settings → Environment Variables
# Добавьте: NEXT_PUBLIC_API_URL = https://xxx.up.railway.app
```

---

## Или используйте веб-интерфейсы:

### Vercel:
1. https://vercel.com → Add New Project
2. Выберите GitHub репозиторий
3. Root Directory: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `.next`
6. Добавьте переменную: `NEXT_PUBLIC_API_URL` (после деплоя backend)

### Railway:
1. https://railway.app → New Project → Deploy from GitHub
2. Выберите репозиторий
3. Root Directory: `backend`
4. Добавьте PostgreSQL (New → Database → PostgreSQL)
5. Environment Variables:
   - `DATABASE_URL` (автоматически)
   - `PORT` = 3001
   - `NODE_ENV` = production
6. После деплоя выполните миграции через Dashboard
