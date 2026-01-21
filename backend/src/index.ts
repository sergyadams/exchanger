import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Логирование всех запросов
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.url}`, { 
    path: req.path, 
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl 
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  logger.info('Health check called');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Простой тест - без async
app.get('/test', (req, res) => {
  res.json({ message: 'Simple test works' });
});

// Тестовый маршрут
app.get('/api/test', (req, res) => {
  logger.info('Test route called');
  res.json({ message: 'API routes are working', timestamp: new Date().toISOString() });
});

// Временный маршрут для валют
app.get('/api/currencies', async (req, res) => {
  logger.info('Currencies route called');
  try {
    const { CurrencyService } = await import('./services/currencyService.js');
    const service = new CurrencyService();
    const currencies = await service.getAllCurrencies();
    logger.info(`Returning ${currencies.length} currencies`);
    res.json({ currencies });
  } catch (error: any) {
    logger.error('Currencies error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch currencies',
      message: error?.message || 'Unknown error',
      code: error?.code || 'UNKNOWN'
    });
  }
});

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

// Fallback удален - он перехватывал все запросы
// Express автоматически вернет 404 для несуществующих маршрутов

// Добавляем обработчик всех маршрутов для отладки
app.use('*', (req, res, next) => {
  logger.info(`[FALLBACK] ${req.method} ${req.originalUrl}`, {
    path: req.path,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    url: req.url
  });
  next();
});

app.listen(PORT, () => {
  logger.info(`Backend server running on http://localhost:${PORT}`);
  logger.info('Registered routes:');
  logger.info('  GET /health');
  logger.info('  GET /test');
  logger.info('  GET /api/test');
  logger.info('  GET /api/currencies');
});
