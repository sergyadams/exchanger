# Статус деплоя

## ✅ GitHub репозиторий
- Репозиторий создан и код загружен
- URL: (проверьте командой: `gh repo view --web`)

## 📋 Следующие шаги:

### 1. Frontend (Vercel) - 2 минуты
1. Откройте: https://vercel.com
2. Войдите через GitHub
3. **Add New Project**
4. Выберите репозиторий `exchanger`
5. **Root Directory:** `frontend` ⚠️ ВАЖНО!
6. Deploy
7. Скопируйте URL

### 2. Backend (Railway) - 3 минуты
1. Откройте: https://railway.app
2. Войдите через GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Выберите `exchanger`
5. Settings → **Root Directory:** `backend`
6. Добавьте PostgreSQL: **+ New** → **Database** → **PostgreSQL**
7. Variables: `PORT=3001`, `NODE_ENV=production`
8. После деплоя выполните миграции

### 3. Миграции
В Railway → Deployments → Run Command:
```bash
cd backend && npx prisma migrate deploy
cd backend && npx prisma db seed
```

### 4. Обновите Frontend
В Vercel → Settings → Environment Variables:
- `NEXT_PUBLIC_API_URL` = URL вашего Railway backend
- Redeploy

---

## 🎉 Готово! Сайт будет доступен по адресу от Vercel
