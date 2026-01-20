# 🎯 Самый простой способ деплоя

## Вариант 1: Через GitHub токен (1 минута)

1. Создайте токен: https://github.com/settings/tokens
   - Нажмите "Generate new token (classic)"
   - Права: `repo` (полный доступ)
   - Скопируйте токен

2. Выполните:
```bash
cd /Users/sergejadamov/exchanger
export GITHUB_TOKEN=ваш_токен_здесь
./create-repo-with-token.sh
```

Это создаст репозиторий и загрузит код автоматически!

---

## Вариант 2: Вручную (2 минуты)

1. Создайте репозиторий: https://github.com/new
2. Название: `exchanger`
3. Скопируйте URL
4. Выполните:
```bash
cd /Users/sergejadamov/exchanger
git remote add origin https://github.com/YOUR_USERNAME/exchanger.git
git branch -M main
git push -u origin main
```

---

## После загрузки кода:

### Frontend (Vercel):
1. https://vercel.com → Add New Project
2. Выберите репозиторий
3. **Root Directory:** `frontend`
4. Deploy

### Backend (Railway):
1. https://railway.app → New Project → Deploy from GitHub
2. Выберите репозиторий
3. **Root Directory:** `backend`
4. Добавьте PostgreSQL
5. Variables: `PORT=3001`, `NODE_ENV=production`

---

**Какой вариант выбираете?**
