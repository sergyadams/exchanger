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

// Тестовый маршрут для диагностики
app.get('/api/test', (req, res) => {
  res.json({ message: 'API routes are working', timestamp: new Date().toISOString() });
});

// Загрузка маршрутов с обработкой ошибок
let routesLoaded = false;

async function loadRoutes() {
  try {
    logger.info('Loading routes...');
    
    const { currenciesRouter } = await import('./routes/currencies.js');
    app.use('/api/currencies', currenciesRouter);
    logger.info('✓ Currencies routes loaded');
    
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
    
    routesLoaded = true;
    logger.info('All routes loaded successfully');
  } catch (error: any) {
    logger.error('Failed to load routes:', error);
    logger.error('Error stack:', error?.stack);
    
    // Fallback route для ошибок
    app.use('/api/*', (req, res) => {
      res.status(500).json({ 
        error: 'Routes not loaded', 
        message: error?.message,
        path: req.originalUrl 
      });
    });
  }
}

// Загружаем маршруты асинхронно
loadRoutes().catch((error) => {
  logger.error('Critical error loading routes:', error);
});

// Fallback для всех остальных маршрутов
app.use('*', (req, res) => {
  if (!routesLoaded) {
    return res.status(503).json({ 
      error: 'Service starting', 
      message: 'Routes are still loading, please try again in a moment',
      path: req.originalUrl 
    });
  }
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.listen(PORT, () => {
  logger.info(`Backend server running on http://localhost:${PORT}`);
});
