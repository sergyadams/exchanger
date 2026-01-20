import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { exchangeRouter } from './routes/exchange.js';
import { ratesRouter } from './routes/rates.js';
import { adminRouter } from './routes/admin.js';
import { currenciesRouter } from './routes/currencies.js';
import { pairsRouter } from './routes/pairs.js';
import { adminWalletsRouter } from './routes/adminWallets.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Тестовый маршрут для диагностики
app.get('/api/test', (req, res) => {
  res.json({ message: 'API routes are working', timestamp: new Date().toISOString() });
});

// Загрузка маршрутов
app.use('/api/exchange', exchangeRouter);
app.use('/api/rates', ratesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin', adminWalletsRouter);
app.use('/api/currencies', currenciesRouter);
app.use('/api/pairs', pairsRouter);

// Fallback для всех остальных маршрутов
app.use('*', (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.listen(PORT, () => {
  logger.info(`Backend server running on http://localhost:${PORT}`);
  logger.info('Routes registered: /api/currencies, /api/pairs, /api/rates, /api/exchange, /api/admin');
});
