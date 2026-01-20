# 🚀 НАЧНИТЕ ЗДЕСЬ - Деплой за 5 минут

## ⚠️ ВАЖНО: Нужен только один шаг от вас!

### Шаг 1: Создайте GitHub репозиторий (1 минута)

1. Откройте: **https://github.com/new**
2. Repository name: `exchanger`
3. Выберите **Public** или **Private**
4. **НЕ** добавляйте README, .gitignore, license
5. Нажмите **Create repository**
6. **Скопируйте URL** (например: `https://github.com/yourusername/exchanger.git`)

---

### Шаг 2: Выполните эти команды

```bash
cd /Users/sergejadamov/exchanger

# Подключите репозиторий (замените YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/exchanger.git
git branch -M main
git push -u origin main
```

**Если попросит пароль:** 
- Используйте Personal Access Token
- Создайте здесь: https://github.com/settings/tokens
- Права: `repo` (полный доступ к репозиториям)

---

### Шаг 3: Деплой Frontend (Vercel) - 2 минуты

1. Откройте: **https://vercel.com**
2. Войдите через **GitHub**
3. **Add New Project** → выберите `exchanger`
4. Настройки:
   - **Root Directory:** `frontend` ⚠️ ВАЖНО!
   - Остальное оставьте по умолчанию
5. Environment Variables: пока пусто (добавим позже)
6. **Deploy**
7. **Скопируйте URL** (например: `https://exchanger.vercel.app`)

---

### Шаг 4: Деплой Backend (Railway) - 3 минуты

1. Откройте: **https://railway.app**
2. Войдите через **GitHub**
3. **New Project** → **Deploy from GitHub repo**
4. Выберите `exchanger`
5. Настройте сервис:
   - Откройте сервис → **Settings**
   - **Root Directory:** `backend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
6. Добавьте PostgreSQL:
   - В проекте: **+ New** → **Database** → **PostgreSQL**
   - `DATABASE_URL` создастся автоматически
7. Environment Variables (Settings → Variables):
   - `PORT` = `3001`
   - `NODE_ENV` = `production`
8. После деплоя **скопируйте URL** (например: `https://exchanger-production.up.railway.app`)

---

### Шаг 5: Миграции базы данных

В Railway Dashboard:
1. Откройте сервис → **Deployments**
2. **Run Command** → выполните:
   ```bash
   cd backend && npx prisma migrate deploy
   ```
3. Затем:
   ```bash
   cd backend && npx prisma db seed
   ```

---

### Шаг 6: Обновите Frontend

1. Vercel Dashboard → проект → **Settings** → **Environment Variables**
2. Добавьте:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** URL вашего Railway backend
3. **Save**
4. **Deployments** → последний деплой → **Redeploy**

---

## ✅ Готово!

Ваш сайт доступен по адресу от Vercel!

---

## 📝 Если нужна помощь:

- Подробная инструкция: `SETUP_DEPLOY.md`
- Альтернативный способ: `AUTO_DEPLOY.md`
