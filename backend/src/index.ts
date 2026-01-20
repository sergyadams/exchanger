import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Загрузка маршрутов с обработкой ошибок
try {
  const { exchangeRouter } = await import('./routes/exchange.js');
  app.use('/api/exchange', exchangeRouter);
  logger.info('Exchange routes loaded');
} catch (error) {
  logger.error('Failed to load exchange routes:', error);
}

try {
  const { ratesRouter } = await import('./routes/rates.js');
  app.use('/api/rates', ratesRouter);
  logger.info('Rates routes loaded');
} catch (error) {
  logger.error('Failed to load rates routes:', error);
}

try {
  const { adminRouter } = await import('./routes/admin.js');
  app.use('/api/admin', adminRouter);
  logger.info('Admin routes loaded');
} catch (error) {
  logger.error('Failed to load admin routes:', error);
}

try {
  const { adminWalletsRouter } = await import('./routes/adminWallets.js');
  app.use('/api/admin', adminWalletsRouter);
  logger.info('Admin wallets routes loaded');
} catch (error) {
  logger.error('Failed to load admin wallets routes:', error);
}

try {
  const { currenciesRouter } = await import('./routes/currencies.js');
  app.use('/api/currencies', currenciesRouter);
  logger.info('Currencies routes loaded');
} catch (error) {
  logger.error('Failed to load currencies routes:', error);
}

try {
  const { pairsRouter } = await import('./routes/pairs.js');
  app.use('/api/pairs', pairsRouter);
  logger.info('Pairs routes loaded');
} catch (error) {
  logger.error('Failed to load pairs routes:', error);
}

app.listen(PORT, () => {
  logger.info(`Backend server running on http://localhost:${PORT}`);
});
