import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Тестовый маршрут
app.get('/api/test', (req, res) => {
  res.json({ message: 'API routes are working', timestamp: new Date().toISOString() });
});

// Загрузка маршрутов синхронно (исправлено)
import { currenciesRouter } from './routes/currencies.js';
import { pairsRouter } from './routes/pairs.js';
import { ratesRouter } from './routes/rates.js';
import { exchangeRouter } from './routes/exchange.js';
import { adminRouter } from './routes/admin.js';
import { adminWalletsRouter } from './routes/adminWallets.js';

try {
  logger.info('Loading routes...');
  
  app.use('/api/currencies', currenciesRouter);
  logger.info('✓ Currencies routes loaded');
  
  app.use('/api/pairs', pairsRouter);
  logger.info('✓ Pairs routes loaded');
  
  app.use('/api/rates', ratesRouter);
  logger.info('✓ Rates routes loaded');
  
  app.use('/api/exchange', exchangeRouter);
  logger.info('✓ Exchange routes loaded');
  
  app.use('/api/admin', adminRouter);
  logger.info('✓ Admin routes loaded');
  
  app.use('/api/admin', adminWalletsRouter);
  logger.info('✓ Admin wallets routes loaded');
  
  logger.info('All routes loaded successfully');
} catch (error: any) {
  logger.error('Failed to load routes:', error);
  logger.error('Error message:', error?.message);
  logger.error('Error stack:', error?.stack);
  
  // Fallback route для ошибок
  app.use('/api/*', (req, res) => {
    res.status(500).json({ 
      error: 'Routes not loaded', 
      message: error?.message || 'Unknown error',
      path: req.originalUrl 
    });
  });
}

// Fallback для всех остальных маршрутов (должен быть последним)
app.use('*', (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.listen(PORT, () => {
  logger.info(`Backend server running on http://localhost:${PORT}`);
});
