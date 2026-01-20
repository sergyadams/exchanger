import fetch from 'node-fetch';
import { CurrencyType, NetworkType, RateSource, type Currency } from '@exchanger/shared';
import { logger } from './logger.js';

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
  };
}

interface RateCache {
  btcUsd: number;
  ethUsd: number;
  usdtUsd: number;
  usdcUsd: number;
  bnbUsd: number;
  tonUsd: number;
  trxUsd: number;
  ltcUsd: number;
  updatedAt: number;
}

let rateCache: RateCache | null = null;
const CACHE_TTL_MS = 30000;
const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

async function fetchRates(): Promise<RateCache> {
  try {
    const response = await fetch(
      `${COINGECKO_API}?ids=bitcoin,ethereum,tether,usd-coin,binancecoin,the-open-network,tron,litecoin&vs_currencies=usd`
    );
    const data = (await response.json()) as CoinGeckoResponse;

    return {
      btcUsd: data.bitcoin?.usd || 45000,
      ethUsd: data.ethereum?.usd || 2500,
      usdtUsd: data.tether?.usd || 1.0,
      usdcUsd: data['usd-coin']?.usd || 1.0,
      bnbUsd: data.binancecoin?.usd || 300,
      tonUsd: data['the-open-network']?.usd || 2.5,
      trxUsd: data.tron?.usd || 0.1,
      ltcUsd: data.litecoin?.usd || 70,
      updatedAt: Date.now(),
    };
  } catch (error) {
    logger.error('Failed to fetch rates from CoinGecko', error);
    return {
      btcUsd: 45000,
      ethUsd: 2500,
      usdtUsd: 1.0,
      usdcUsd: 1.0,
      bnbUsd: 300,
      tonUsd: 2.5,
      trxUsd: 0.1,
      ltcUsd: 70,
      updatedAt: Date.now(),
    };
  }
}

export async function getRates(): Promise<RateCache> {
  const now = Date.now();
  
  if (!rateCache || now - rateCache.updatedAt > CACHE_TTL_MS) {
    rateCache = await fetchRates();
  }
  
  return rateCache;
}

export function getRate(
  from: Currency,
  to: Currency,
  rates: RateCache,
  rateSource: RateSource
): number {
  if (from.code === to.code) return 1;

  if (rateSource === RateSource.FIXED) {
    // Fixed rates для некоторых пар
    if (from.code === 'USDT_TRC20' && to.code === 'USDT_ERC20') return 1;
    if (from.code === 'USDT_ERC20' && to.code === 'USDT_TRC20') return 1;
  }

  if (rateSource === RateSource.MANUAL) {
    // Manual rates для фиата
    if (to.type === 'FIAT') {
      if (to.code.startsWith('RUB')) return 90;
      if (to.code.startsWith('USD')) return 1;
      if (to.code.startsWith('EUR')) return 0.92;
    }
  }

  // CoinGecko rates
  const getCryptoUsd = (code: string): number => {
    if (code.startsWith('BTC')) return rates.btcUsd;
    if (code.startsWith('ETH')) return rates.ethUsd;
    if (code.startsWith('USDT') || code.startsWith('USDC')) return rates.usdtUsd;
    if (code.startsWith('BNB')) return rates.bnbUsd;
    if (code.startsWith('TON')) return rates.tonUsd;
    if (code.startsWith('TRX')) return rates.trxUsd;
    if (code.startsWith('LTC')) return rates.ltcUsd;
    return 1;
  };

  const fromUsd = getCryptoUsd(from.code);
  const toUsd = getCryptoUsd(to.code);

  if (to.type === 'FIAT') {
    if (to.code.startsWith('RUB')) return fromUsd * 90;
    if (to.code.startsWith('USD')) return fromUsd;
    if (to.code.startsWith('EUR')) return fromUsd * 0.92;
  }

  if (from.type === 'FIAT') {
    const fromRate = from.code.startsWith('RUB') ? 90 : from.code.startsWith('EUR') ? 0.92 : 1;
    return (1 / fromRate) * toUsd;
  }

  return fromUsd / toUsd;
}
