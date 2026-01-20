# 🚀 Статус деплоя

## ✅ Что готово:

1. ✅ Git репозиторий инициализирован
2. ✅ Все файлы закоммичены
3. ✅ Конфигурации для деплоя созданы
4. ✅ GitHub CLI установлен

## 📋 Следующие шаги:

### 1. Авторизация в GitHub (если еще не авторизованы):

```bash
cd /Users/sergejadamov/exchanger
gh auth login
```

Следуйте инструкциям в браузере.

### 2. Создание репозитория и загрузка кода:

```bash
cd /Users/sergejadamov/exchanger
./auto-deploy.sh
```

Или вручную:

```bash
gh repo create exchanger --public --source=. --remote=origin --push
```

### 3. Деплой Frontend (Vercel):

1. Откройте: https://vercel.com
2. Войдите через GitHub
3. **Add New Project** → выберите `exchanger`
4. **Root Directory:** `frontend` ⚠️
5. Deploy

### 4. Деплой Backend (Railway):

1. Откройте: https://railway.app
2. Войдите через GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Выберите `exchanger`
5. **Root Directory:** `backend`
6. Добавьте PostgreSQL
7. Variables: `PORT=3001`, `NODE_ENV=production`

### 5. Миграции:

В Railway → Deployments → Run Command:
```bash
cd backend && npx prisma migrate deploy
cd backend && npx prisma db seed
```

### 6. Обновите Frontend:

Vercel → Settings → Environment Variables:
- `NEXT_PUBLIC_API_URL` = URL вашего Railway backend

---

## 🔗 Полезные ссылки:

- GitHub репозиторий: (будет создан после авторизации)
- Vercel: https://vercel.com
- Railway: https://railway.app
