import { Router } from 'express';
import { CurrencyService } from '../services/currencyService.js';
import { CurrencyType } from '@exchanger/shared';

const router = Router();
const currencyService = new CurrencyService();

router.get('/', async (req, res) => {
  try {
    const currencies = await currencyService.getAllCurrencies();
    res.json({ currencies });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
});

router.get('/crypto', async (req, res) => {
  try {
    const currencies = await currencyService.getCurrenciesByType(CurrencyType.CRYPTO);
    res.json({ currencies });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch crypto currencies' });
  }
});

router.get('/fiat', async (req, res) => {
  try {
    const currencies = await currencyService.getCurrenciesByType(CurrencyType.FIAT);
    res.json({ currencies });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fiat currencies' });
  }
});

export { router as currenciesRouter };
