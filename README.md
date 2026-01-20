# DemoEx - Instant Crypto Exchange (Demo)

⚠️ **DEMO PLATFORM - NOT A FINANCIAL SERVICE**

This is a demonstration platform for testing crypto exchange logic and architecture. **No real funds are processed. All transactions are simulated.**

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- (Optional) Docker and Docker Compose (for PostgreSQL, but SQLite is configured by default)

### Installation

1. **Install Node.js** (if not installed):
   - Download from https://nodejs.org/ or use nvm: `nvm install 18`

2. **Install dependencies:**

```bash
npm run install:all
```

Or manually:
```bash
npm install
cd shared && npm install && cd ..
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

3. **Set up environment variables:**

```bash
# Backend - SQLite is already configured (no .env needed for SQLite)
# But if you want to customize, create backend/.env:
# DATABASE_URL="file:./dev.db"

# Frontend
cp frontend/.env.example frontend/.env
# Or create frontend/.env with:
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up database (SQLite - no Docker needed):**

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
cd ..
```

5. **Run development servers:**

```bash
npm run dev
```

This starts:
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

**Note:** The project is configured to use SQLite by default (no Docker required). The database file will be created at `backend/dev.db`.

## 📁 Project Structure

```
exchanger/
├── frontend/          # Next.js 14 App Router
├── backend/           # Express + TypeScript
├── shared/            # Shared types
├── docker-compose.yml # PostgreSQL container
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables

**SQLite (default - no .env needed):**
- Database file will be created at `backend/dev.db`
- No configuration required

**Or create `backend/.env` to customize:**
```env
DATABASE_URL="file:./dev.db"
PORT=3001
LOG_LEVEL=info
NODE_ENV=development
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Using PostgreSQL (Optional)

The project is configured to use SQLite by default. To use PostgreSQL instead:

1. Update `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Add back `@db.Decimal` annotations to Decimal fields in schema.prisma

3. Start PostgreSQL:
```bash
docker-compose up -d
```

4. Set in `backend/.env`:
```env
DATABASE_URL="postgresql://exchanger:exchanger_password@localhost:5432/exchanger?schema=public"
```

## 📚 Features

### User Features
- ✅ Create exchange orders (BTC ↔ USDT, BTC → RUB, USDT → RUB)
- ✅ View order status and timeline
- ✅ Real-time rate calculation (CoinGecko API)
- ✅ QR codes for payment addresses
- ✅ Order expiration (20 minutes)

### Admin Features
- ✅ View all orders with filters
- ✅ Change order statuses
- ✅ Add admin notes
- ✅ View order timeline/audit log

### Pages
- `/` - Exchange form
- `/order/[id]` - Order details
- `/rates` - Exchange rates
- `/faq` - FAQ
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy
- `/aml-kyc` - AML/KYC Policy (placeholder)
- `/admin` - Admin dashboard
- `/admin/orders/[id]` - Admin order management

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Zustand
- QR Code generation

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL (or SQLite)
- CoinGecko API (rate provider)
- Winston (logging)

### Shared
- TypeScript types and enums

## 🔐 Security & Safety

- ⚠️ **DEMO MODE** banners throughout UI
- ⚠️ Warnings on order pages about demo addresses
- Rate limiting on API endpoints
- No real financial transactions
- No real cryptocurrency addresses

## 📝 API Endpoints

### Exchange
- `POST /api/exchange/calculate` - Calculate exchange rate
- `POST /api/exchange/create` - Create new order
- `GET /api/exchange/:id` - Get order details
- `POST /api/exchange/:id/mark-sent` - Mark order as sent

### Rates
- `GET /api/rates` - Get all exchange rates

### Admin
- `GET /api/admin/orders` - List orders (with filters)
- `GET /api/admin/orders/:id` - Get order details
- `PATCH /api/admin/orders/:id/status` - Update order status

## 🗄️ Database Schema

### Order
- Order details, amounts, rates, fees
- Status tracking
- Expiration timestamps

### OrderStatusEvent
- Audit trail of status changes
- Actor (USER/ADMIN)
- Timestamps and notes

## 🚧 Roadmap

- [ ] Real-time order updates (WebSocket)
- [ ] Email notifications (demo)
- [ ] More exchange pairs
- [ ] Order history for users
- [ ] Admin authentication
- [ ] Rate limit UI feedback
- [ ] Better error handling
- [ ] Unit tests
- [ ] E2E tests

## ⚠️ Disclaimer

**This is a DEMO platform only.**

- NOT a licensed financial service
- NO real funds are processed
- NO custody is provided
- NO real transactions occur
- Use at your own risk

Do NOT send real cryptocurrencies to any addresses shown on this platform.

## 📄 License

This is a demo project for educational purposes.

## 🤝 Contributing

This is a demo project. Contributions are welcome for educational purposes only.

---

**Remember: This is DEMO ONLY. No real funds should be sent.**
