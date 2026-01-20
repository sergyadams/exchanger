# 🚀 Инструкция по деплою (5 минут)

## Шаг 1: Создайте GitHub репозиторий

1. Откройте https://github.com/new
2. Repository name: `exchanger` (или любое другое)
3. Выберите **Public** или **Private**
4. **НЕ** добавляйте README, .gitignore, license
5. Нажмите **Create repository**
6. **Скопируйте URL** (например: `https://github.com/yourusername/exchanger.git`)

---

## Шаг 2: Загрузите код в GitHub

Выполните эти команды (замените YOUR_USERNAME на ваш GitHub username):

```bash
cd /Users/sergejadamov/exchanger

# Подключите репозиторий
git remote add origin https://github.com/YOUR_USERNAME/exchanger.git
git branch -M main
git push -u origin main
```

**Если попросит пароль:** используйте Personal Access Token (Settings → Developer settings → Personal access tokens)

---

## Шаг 3: Деплой Frontend (Vercel) - 2 минуты

1. Откройте https://vercel.com
2. Войдите через **GitHub**
3. Нажмите **Add New Project**
4. Выберите репозиторий `exchanger`
5. Настройки:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend` (важно!)
   - **Build Command:** `npm run build` (оставьте по умолчанию)
   - **Output Directory:** `.next` (оставьте по умолчанию)
6. Environment Variables:
   - Пока оставьте пустым (добавим после деплоя backend)
7. Нажмите **Deploy**
8. **Скопируйте URL** (например: `https://exchanger.vercel.app`)

---

## Шаг 4: Деплой Backend (Railway) - 3 минуты

1. Откройте https://railway.app
2. Войдите через **GitHub**
3. Нажмите **New Project** → **Deploy from GitHub repo**
4. Выберите репозиторий `exchanger`
5. Railway автоматически определит проект
6. Настройте сервис:
   - Откройте сервис → Settings
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
7. Добавьте PostgreSQL:
   - В проекте нажмите **+ New** → **Database** → **PostgreSQL**
   - Railway автоматически создаст `DATABASE_URL`
8. Environment Variables (Settings → Variables):
   - `PORT` = `3001`
   - `NODE_ENV` = `production`
   - `DATABASE_URL` уже есть (из PostgreSQL)
9. После деплоя **скопируйте URL** (например: `https://exchanger-production.up.railway.app`)

---

## Шаг 5: Миграции базы данных

В Railway Dashboard:
1. Откройте ваш сервис
2. Перейдите на вкладку **Deployments**
3. Нажмите **Run Command**
4. Выполните команды по очереди:

```bash
cd backend && npx prisma migrate deploy
```

```bash
cd backend && npx prisma db seed
```

---

## Шаг 6: Обновите Frontend

1. Вернитесь в Vercel Dashboard
2. Откройте проект → **Settings** → **Environment Variables**
3. Добавьте переменную:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** URL вашего Railway backend (например: `https://exchanger-production.up.railway.app`)
4. Нажмите **Save**
5. Перейдите в **Deployments** → выберите последний деплой → **Redeploy**

---

## Готово! 🎉

Ваш сайт доступен по адресу от Vercel (например: `https://exchanger.vercel.app`)

---

## Если что-то не работает:

1. Проверьте что backend отвечает: `https://your-railway-url.railway.app/health`
2. Проверьте переменные окружения в Vercel
3. Проверьте логи в Railway Dashboard
