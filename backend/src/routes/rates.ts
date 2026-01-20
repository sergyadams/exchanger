import { Router } from 'express';
import { getRates, getRate } from '../utils/rateProvider.js';
import { CurrencyService } from '../services/currencyService.js';
import { ExchangePairService } from '../services/exchangePairService.js';

const router = Router();
const currencyService = new CurrencyService();
const pairService = new ExchangePairService();

router.get('/', async (req, res) => {
  try {
    const rates = await getRates();
    const pairs = await pairService.getAllPairs();
    const currencies = await currencyService.getAllCurrencies();

    const rateList = pairs.map((pair) => {
      const fromCurrency = currencies.find((c) => c.code === pair.fromCurrencyCode);
      const toCurrency = currencies.find((c) => c.code === pair.toCurrencyCode);
      
      if (!fromCurrency || !toCurrency) return null;

      return {
        fromCurrencyCode: pair.fromCurrencyCode,
        toCurrencyCode: pair.toCurrencyCode,
        fromCurrencyName: fromCurrency.name,
        toCurrencyName: toCurrency.name,
        rate: getRate(fromCurrency, toCurrency, rates, pair.rateSource),
        rateSource: pair.rateSource,
        updatedAt: new Date(rates.updatedAt).toISOString(),
      };
    }).filter(Boolean);

    res.json({
      rates: rateList,
      updatedAt: new Date(rates.updatedAt).toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rates' });
  }
});

export { router as ratesRouter };
