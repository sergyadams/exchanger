import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Логирование всех запросов (ПЕРВЫМ, до всех маршрутов)
app.use((req, res, next) => {
  logger.info(`[REQUEST] ${req.method} ${req.url}`, { 
    path: req.path, 
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    url: req.url,
    headers: {
      host: req.headers.host,
      'user-agent': req.headers['user-agent']
    }
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  logger.info('[HEALTH] Health check called');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Простой тест - без async
app.get('/test', (req, res) => {
  logger.info('[TEST] Simple test route called');
  res.json({ message: 'Simple test works' });
});

// ВСЕ маршруты БЕЗ /api префикса (Railway перехватывает /api/*)
app.get('/currencies', async (req, res) => {
  logger.info('[CURRENCIES] ====== CURRENCIES ROUTE CALLED ======');
  logger.info(`[CURRENCIES] Request from: ${req.headers.host || 'unknown'}`);
  try {
    const { CurrencyService } = await import('./services/currencyService.js');
    const service = new CurrencyService();
    logger.info('[CURRENCIES] CurrencyService imported, fetching currencies...');
    let currencies = await service.getAllCurrencies();
    logger.info(`[CURRENCIES] Fetched ${currencies.length} currencies from DB`);
    
    // Если валют нет - создаем их напрямую
    if (currencies.length === 0) {
      logger.warn('[CURRENCIES] ====== NO CURRENCIES FOUND, CREATING THEM ======');
      try {
        logger.info('[CURRENCIES] Importing prisma and shared types...');
        const { prisma } = await import('./utils/prisma.js');
        const { CurrencyType, NetworkType } = await import('@exchanger/shared');
        logger.info('[CURRENCIES] Imports successful, preparing currency data...');
        
        // Создаем основные валюты
        const currencyData = [
          { code: 'BTC', name: 'Bitcoin', type: CurrencyType.CRYPTO, network: NetworkType.BTC, isManual: false, precision: 8, minAmount: 0.0001, maxAmount: 10, enabled: true },
          { code: 'ETH', name: 'Ethereum', type: CurrencyType.CRYPTO, network: NetworkType.ETH, isManual: false, precision: 8, minAmount: 0.001, maxAmount: 100, enabled: true },
          { code: 'USDT_TRC20', name: 'Tether (TRC20)', type: CurrencyType.CRYPTO, network: NetworkType.TRON, isManual: false, precision: 6, minAmount: 10, maxAmount: 50000, enabled: true },
          { code: 'USDT_ERC20', name: 'Tether (ERC20)', type: CurrencyType.CRYPTO, network: NetworkType.ETH, isManual: false, precision: 6, minAmount: 10, maxAmount: 50000, enabled: true },
          { code: 'USDC', name: 'USD Coin', type: CurrencyType.CRYPTO, network: NetworkType.ETH, isManual: false, precision: 6, minAmount: 10, maxAmount: 50000, enabled: true },
          { code: 'BNB', name: 'Binance Coin', type: CurrencyType.CRYPTO, network: NetworkType.BSC, isManual: false, precision: 8, minAmount: 0.01, maxAmount: 1000, enabled: true },
          { code: 'TON', name: 'Toncoin', type: CurrencyType.CRYPTO, network: NetworkType.TON, isManual: false, precision: 8, minAmount: 1, maxAmount: 10000, enabled: true },
          { code: 'TRX', name: 'Tron', type: CurrencyType.CRYPTO, network: NetworkType.TRON, isManual: false, precision: 6, minAmount: 100, maxAmount: 100000, enabled: true },
          { code: 'LTC', name: 'Litecoin', type: CurrencyType.CRYPTO, network: NetworkType.LTC, isManual: false, precision: 8, minAmount: 0.01, maxAmount: 500, enabled: true },
          { code: 'RUB_SBER', name: 'RUB (Sber)', type: CurrencyType.FIAT, network: null, isManual: true, precision: 2, minAmount: 100, maxAmount: 1000000, enabled: true },
          { code: 'RUB_TINKOFF', name: 'RUB (Tinkoff)', type: CurrencyType.FIAT, network: null, isManual: true, precision: 2, minAmount: 100, maxAmount: 1000000, enabled: true },
          { code: 'RUB_SBP', name: 'RUB (SBP)', type: CurrencyType.FIAT, network: null, isManual: true, precision: 2, minAmount: 100, maxAmount: 1000000, enabled: true },
          { code: 'RUB_CASH', name: 'RUB (Cash)', type: CurrencyType.FIAT, network: null, isManual: true, precision: 2, minAmount: 1000, maxAmount: 500000, enabled: true },
          { code: 'USD_BANK', name: 'USD (Bank)', type: CurrencyType.FIAT, network: null, isManual: true, precision: 2, minAmount: 10, maxAmount: 10000, enabled: true },
          { code: 'USD_CASH', name: 'USD (Cash)', type: CurrencyType.FIAT, network: null, isManual: true, precision: 2, minAmount: 50, maxAmount: 5000, enabled: true },
          { code: 'EUR_SEPA', name: 'EUR (SEPA)', type: CurrencyType.FIAT, network: null, isManual: true, precision: 2, minAmount: 10, maxAmount: 10000, enabled: true },
          { code: 'EUR_CASH', name: 'EUR (Cash)', type: CurrencyType.FIAT, network: null, isManual: true, precision: 2, minAmount: 50, maxAmount: 5000, enabled: true },
        ];
        
        let createdCount = 0;
        for (const currency of currencyData) {
          try {
            const result = await prisma.currency.upsert({
              where: { code: currency.code },
              update: {},
              create: currency as any,
            });
            createdCount++;
            logger.info(`[CURRENCIES] Created/updated ${currency.code}`);
          } catch (e: any) {
            logger.error(`[CURRENCIES] Failed to create ${currency.code}:`, {
              message: e?.message,
              code: e?.code,
              stack: e?.stack
            });
          }
        }
        
        logger.info(`[CURRENCIES] Created ${createdCount} currencies, fetching again...`);
        currencies = await service.getAllCurrencies();
        logger.info(`[CURRENCIES] After create: ${currencies.length} currencies`);
        
        // Если все еще пусто - проверяем подключение к БД
        if (currencies.length === 0) {
          logger.error('[CURRENCIES] Still no currencies after creation attempt');
          // Пробуем простой запрос к БД для проверки подключения
          try {
            const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
            logger.info('[CURRENCIES] DB connection OK, but currencies not created');
            return res.status(500).json({ 
              error: 'Failed to create currencies',
              currencies: [],
              message: 'Database connected but currencies not created. Check Railway logs for errors.'
            });
          } catch (dbError: any) {
            logger.error('[CURRENCIES] DB connection failed:', dbError);
            return res.status(500).json({ 
              error: 'Database not initialized',
              currencies: [],
              message: `Database connection failed: ${dbError?.message || 'Unknown error'}. Run migrations first.`
            });
          }
        }
      } catch (directError: any) {
        logger.error('[CURRENCIES] Direct create failed:', directError);
      }
    }
    
    res.json({ currencies });
  } catch (error: any) {
    logger.error('[CURRENCIES] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch currencies',
      message: error?.message || 'Unknown error',
      code: error?.code || 'UNKNOWN'
    });
  }
});

// Тестовый маршрут
app.get('/api/test', (req, res) => {
  logger.info('[API_TEST] Test route called');
  res.json({ message: 'API routes are working', timestamp: new Date().toISOString() });
});

// Временный маршрут для валют
app.get('/api/currencies', async (req, res) => {
  logger.info('[CURRENCIES] Currencies route called');
  try {
    const { CurrencyService } = await import('./services/currencyService.js');
    const service = new CurrencyService();
    const currencies = await service.getAllCurrencies();
    logger.info(`[CURRENCIES] Returning ${currencies.length} currencies`);
    res.json({ currencies });
  } catch (error: any) {
    logger.error('[CURRENCIES] Error:', error);
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
  app.use('/pairs', pairsRouter);
  logger.info('✓ Pairs routes loaded');
  
  const { ratesRouter } = await import('./routes/rates.js');
  app.use('/rates', ratesRouter);
  logger.info('✓ Rates routes loaded');
  
  const { exchangeRouter } = await import('./routes/exchange.js');
  app.use('/exchange', exchangeRouter);
  logger.info('✓ Exchange routes loaded');
  
  const { adminRouter } = await import('./routes/admin.js');
  app.use('/admin', adminRouter);
  logger.info('✓ Admin routes loaded');
  
  const { adminWalletsRouter } = await import('./routes/adminWallets.js');
  app.use('/admin', adminWalletsRouter);
  logger.info('✓ Admin wallets routes loaded');
  
  logger.info('All routes loaded successfully');
} catch (error: any) {
  logger.error('Failed to load some routes:', error);
  logger.error('Error message:', error?.message);
  logger.error('Error stack:', error?.stack);
}

// Fallback удален - он перехватывал все запросы
// Express автоматически вернет 404 для несуществующих маршрутов

// Добавляем обработчик всех маршрутов для отладки (ПОСЛЕ всех маршрутов)
app.use((req, res, next) => {
  logger.info(`[404 FALLBACK] ${req.method} ${req.originalUrl}`, {
    path: req.path,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    url: req.url
  });
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    originalUrl: req.originalUrl,
    method: req.method
  });
});

// Выводим все зарегистрированные маршруты
app._router?.stack?.forEach((middleware: any) => {
  if (middleware.route) {
    logger.info(`[ROUTE] ${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
  }
});

app.listen(PORT, () => {
  logger.info(`Backend server running on http://localhost:${PORT}`);
  logger.info('Registered routes:');
  logger.info('  GET /health');
  logger.info('  GET /test');
  logger.info('  GET /api/test');
  logger.info('  GET /api/currencies');
  
  // Тест: проверяем, что маршруты действительно зарегистрированы
  const routes: string[] = [];
  app._router?.stack?.forEach((middleware: any) => {
    if (middleware.route) {
      routes.push(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
    }
  });
  logger.info(`[ROUTES COUNT] Total routes registered: ${routes.length}`);
  routes.forEach(route => logger.info(`[ROUTE] ${route}`));
});
