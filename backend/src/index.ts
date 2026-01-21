import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Health check - ПЕРВЫМ
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Тестовый маршрут - ВТОРЫМ
app.get('/api/test', (req, res) => {
  res.json({ message: 'API routes are working', timestamp: new Date().toISOString() });
});

// Временный маршрут для валют - ТРЕТЬИМ
app.get('/api/currencies', async (req, res) => {
  try {
    const { CurrencyService } = await import('./services/currencyService.js');
    const service = new CurrencyService();
    const currencies = await service.getAllCurrencies();
    res.json({ currencies });
  } catch (error: any) {
    logger.error('Currencies error:', error);
    logger.error('Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    });
    res.status(500).json({ 
      error: 'Failed to fetch currencies',
      message: error?.message || 'Unknown error',
      code: error?.code || 'UNKNOWN',
      details: process.env.DATABASE_URL ? 'DATABASE_URL is set' : 'DATABASE_URL is NOT set'
    });
  }
});

app.use(cors());
app.use(express.json());

// Загрузка остальных маршрутов (НЕ перезаписываем /api/currencies)
try {
  logger.info('Loading routes...');
  
  // НЕ загружаем currenciesRouter - используем временный маршрут выше
  // const { currenciesRouter } = await import('./routes/currencies.js');
  // app.use('/api/currencies', currenciesRouter);
  // logger.info('✓ Currencies routes loaded');
  
  const { pairsRouter } = await import('./routes/pairs.js');
  app.use('/api/pairs', pairsRouter);
  logger.info('✓ Pairs routes loaded');
  
  const { ratesRouter } = await import('./routes/rates.js');
  app.use('/api/rates', ratesRouter);
  logger.info('✓ Rates routes loaded');
  
  const { exchangeRouter } = await import('./routes/exchange.js');
  app.use('/api/exchange', exchangeRouter);
  logger.info('✓ Exchange routes loaded');
  
  const { adminRouter } = await import('./routes/admin.js');
  app.use('/api/admin', adminRouter);
  logger.info('✓ Admin routes loaded');
  
  const { adminWalletsRouter } = await import('./routes/adminWallets.js');
  app.use('/api/admin', adminWalletsRouter);
  logger.info('✓ Admin wallets routes loaded');
  
  logger.info('All routes loaded successfully');
} catch (error: any) {
  logger.error('Failed to load some routes:', error);
  logger.error('Error message:', error?.message);
  logger.error('Error stack:', error?.stack);
}

// Fallback для всех остальных маршрутов (должен быть последним)
// НЕ используем app.all('*') - он перехватывает все запросы
// Вместо этого регистрируем только для необработанных путей
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.listen(PORT, () => {
  logger.info(`Backend server running on http://localhost:${PORT}`);
});
