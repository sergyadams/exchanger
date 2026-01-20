# Быстрый запуск в интернете

## Вариант 1: ngrok (самый быстрый, 2 минуты)

### Установка ngrok:
```bash
brew install ngrok
# или скачайте с https://ngrok.com
```

### Запуск:
1. Запустите backend и frontend локально:
```bash
npm run dev
```

2. В новом терминале запустите ngrok для frontend:
```bash
ngrok http 3000
```

3. Скопируйте HTTPS URL (например: `https://abc123.ngrok.io`)

4. Обновите `NEXT_PUBLIC_API_URL` в `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

5. Перезапустите frontend

**Результат:** Сайт будет доступен по HTTPS URL от ngrok

---

## Вариант 2: Полный деплой (Vercel + Railway)

Следуйте инструкциям в `README_DEPLOY.md`

**Время:** ~15-20 минут
**Результат:** Постоянный URL с автоматическим деплоем
