# ⚡ ДЕПЛОЙ ПРЯМО СЕЙЧАС

## 🎯 Что нужно от вас:

**ТОЛЬКО ОДИН ШАГ:** Создайте GitHub репозиторий

1. Откройте: https://github.com/new
2. Repository name: `exchanger`
3. **НЕ** добавляйте README, .gitignore, license
4. Нажмите **Create repository**
5. **Скопируйте URL** (например: `https://github.com/yourusername/exchanger.git`)

---

## 🚀 Затем выполните:

```bash
cd /Users/sergejadamov/exchanger

# Вставьте ваш URL вместо YOUR_USERNAME/exchanger.git
git remote add origin https://github.com/YOUR_USERNAME/exchanger.git
git branch -M main
git push -u origin main
```

**Если попросит пароль:** используйте Personal Access Token из https://github.com/settings/tokens

---

## 📱 Деплой через веб-интерфейсы (5 минут):

### Frontend (Vercel):
1. https://vercel.com → Add New Project
2. Выберите репозиторий `exchanger`
3. **Root Directory:** `frontend` ⚠️
4. Deploy

### Backend (Railway):
1. https://railway.app → New Project → Deploy from GitHub
2. Выберите `exchanger`
3. **Root Directory:** `backend`
4. Добавьте PostgreSQL (New → Database → PostgreSQL)
5. Variables: `PORT=3001`, `NODE_ENV=production`
6. После деплоя выполните миграции (Deployments → Run Command):
   - `cd backend && npx prisma migrate deploy`
   - `cd backend && npx prisma db seed`

### Обновите Frontend:
1. Vercel → Settings → Environment Variables
2. Добавьте: `NEXT_PUBLIC_API_URL` = URL вашего Railway backend
3. Redeploy

---

## ✅ Готово! Сайт будет доступен по адресу от Vercel
