import { CurrencyType, NetworkType, RateSource, OrderStatus, StatusActor } from '@exchanger/shared';
import { generateShortId } from '../utils/shortId.js';
import { generateMockAddress } from '../utils/addressGenerator.js';
import { prisma } from '../utils/prisma.js';

async function main() {
  // Создание валют
  const currencies = [
    // Crypto
    { code: 'BTC', name: 'Bitcoin', type: CurrencyType.CRYPTO, network: NetworkType.BTC, isManual: false, precision: 8, minAmount: 0.0001, maxAmount: 10 },
    { code: 'ETH', name: 'Ethereum', type: CurrencyType.CRYPTO, network: NetworkType.ETH, isManual: false, precision: 8, minAmount: 0.001, maxAmount: 100 },
    { code: 'USDT_TRC20', name: 'Tether (TRC20)', type: CurrencyType.CRYPTO, network: NetworkType.TRON, isManual: false, precision: 6, minAmount: 10, maxAmount: 50000 },
    { code: 'USDT_ERC20', name: 'Tether (ERC20)', type: CurrencyType.CRYPTO, network: NetworkType.ETH, isManual: false, precision: 6, minAmount: 10, maxAmount: 50000 },
    { code: 'USDC', name: 'USD Coin', type: CurrencyType.CRYPTO, network: NetworkType.ETH, isManual: false, precision: 6, minAmount: 10, maxAmount: 50000 },
    { code: 'BNB', name: 'Binance Coin', type: CurrencyType.CRYPTO, network: NetworkType.BSC, isManual: false, precision: 8, minAmount: 0.01, maxAmount: 1000 },
    { code: 'TON', name: 'Toncoin', type: CurrencyType.CRYPTO, network: NetworkType.TON, isManual: false, precision: 8, minAmount: 1, maxAmount: 10000 },
    { code: 'TRX', name: 'Tron', type: CurrencyType.CRYPTO, network: NetworkType.TRON, isManual: false, precision: 6, minAmount: 100, maxAmount: 100000 },
    { code: 'LTC', name: 'Litecoin', type: CurrencyType.CRYPTO, network: NetworkType.LTC, isManual: false, precision: 8, minAmount: 0.01, maxAmount: 500 },
    
    // Fiat - RUB
    { code: 'RUB_SBER', name: 'RUB (Sber)', type: CurrencyType.FIAT, network: null, isManual: true, precision: 2, minAmount: 100, maxAmount: 1000000 },
    { code: 'RUB_TINKOFF', name: 'RUB (Tinkoff)', type: CurrencyType.FIAT, network: null, isManual: true, precision: 2, minAmount: 100, maxAmount: 1000000 },
    { code: 'RUB_SBP', name: 'RUB (SBP)', type: CurrencyType.FIAT, network: null, isManual: true, precision: 2, minAmount: 100, maxAmount: 1000000 },
    { code: 'RUB_CASH', name: 'RUB (Cash)', type: CurrencyType.FIAT, network: null, isManual: true, precision: 2, minAmount: 1000, maxAmount: 500000 },
    
    // Fiat - USD
    { code: 'USD_BANK', name: 'USD (Bank)', type: CurrencyType.FIAT, network: null, isManual: true, precision: 2, minAmount: 10, maxAmount: 10000 },
    { code: 'USD_CASH', name: 'USD (Cash)', type: CurrencyType.FIAT, network: null, isManual: true, precision: 2, minAmount: 50, maxAmount: 5000 },
    
    // Fiat - EUR
    { code: 'EUR_SEPA', name: 'EUR (SEPA)', type: CurrencyType.FIAT, network: null, isManual: true, precision: 2, minAmount: 10, maxAmount: 10000 },
    { code: 'EUR_CASH', name: 'EUR (Cash)', type: CurrencyType.FIAT, network: null, isManual: true, precision: 2, minAmount: 50, maxAmount: 5000 },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: currency,
      create: currency,
    });
  }

  // Создание пар обмена
  const pairs = [
    // BTC pairs
    { from: 'BTC', to: 'USDT_TRC20', feePct: 0.7, rateSource: RateSource.COINGECKO },
    { from: 'BTC', to: 'USDT_ERC20', feePct: 0.7, rateSource: RateSource.COINGECKO },
    { from: 'BTC', to: 'ETH', feePct: 0.7, rateSource: RateSource.COINGECKO },
    { from: 'BTC', to: 'RUB_SBER', feePct: 0.7, rateSource: RateSource.MANUAL },
    { from: 'BTC', to: 'USD_BANK', feePct: 0.7, rateSource: RateSource.MANUAL },
    { from: 'BTC', to: 'EUR_SEPA', feePct: 0.7, rateSource: RateSource.MANUAL },
    
    // ETH pairs
    { from: 'ETH', to: 'USDT_ERC20', feePct: 0.7, rateSource: RateSource.COINGECKO },
    { from: 'ETH', to: 'USDC', feePct: 0.7, rateSource: RateSource.COINGECKO },
    { from: 'ETH', to: 'BTC', feePct: 0.7, rateSource: RateSource.COINGECKO },
    { from: 'ETH', to: 'RUB_SBER', feePct: 0.7, rateSource: RateSource.MANUAL },
    
    // USDT pairs
    { from: 'USDT_TRC20', to: 'BTC', feePct: 0.7, rateSource: RateSource.COINGECKO },
    { from: 'USDT_TRC20', to: 'USDT_ERC20', feePct: 0.5, rateSource: RateSource.FIXED },
    { from: 'USDT_TRC20', to: 'RUB_SBER', feePct: 0.7, rateSource: RateSource.MANUAL },
    { from: 'USDT_TRC20', to: 'RUB_TINKOFF', feePct: 0.7, rateSource: RateSource.MANUAL },
    { from: 'USDT_TRC20', to: 'USD_BANK', feePct: 0.7, rateSource: RateSource.MANUAL },
    { from: 'USDT_TRC20', to: 'EUR_SEPA', feePct: 0.7, rateSource: RateSource.MANUAL },
    
    { from: 'USDT_ERC20', to: 'BTC', feePct: 0.7, rateSource: RateSource.COINGECKO },
    { from: 'USDT_ERC20', to: 'USDT_TRC20', feePct: 0.5, rateSource: RateSource.FIXED },
    { from: 'USDT_ERC20', to: 'ETH', feePct: 0.7, rateSource: RateSource.COINGECKO },
    { from: 'USDT_ERC20', to: 'RUB_SBER', feePct: 0.7, rateSource: RateSource.MANUAL },
    
    // Other crypto pairs
    { from: 'BNB', to: 'BTC', feePct: 0.7, rateSource: RateSource.COINGECKO },
    { from: 'BNB', to: 'USDT_TRC20', feePct: 0.7, rateSource: RateSource.COINGECKO },
    { from: 'TON', to: 'USDT_TRC20', feePct: 0.7, rateSource: RateSource.COINGECKO },
    { from: 'LTC', to: 'BTC', feePct: 0.7, rateSource: RateSource.COINGECKO },
  ];

  for (const pair of pairs) {
    await prisma.exchangePair.upsert({
      where: {
        fromCurrencyCode_toCurrencyCode: {
          fromCurrencyCode: pair.from,
          toCurrencyCode: pair.to,
        },
      },
      update: {
        feePct: pair.feePct,
        rateSource: pair.rateSource,
        enabled: true,
      },
      create: {
        fromCurrencyCode: pair.from,
        toCurrencyCode: pair.to,
        feePct: pair.feePct,
        rateSource: pair.rateSource,
        enabled: true,
      },
    });
  }

  // Создание тестовых заявок
  const testOrders = [
    {
      shortId: generateShortId(),
      fromCurrencyCode: 'BTC',
      toCurrencyCode: 'USDT_TRC20',
      fromNetwork: NetworkType.BTC,
      toNetwork: NetworkType.TRON,
      amountFrom: 0.1,
      amountTo: 9100,
      rate: 91000,
      feePct: 0.7,
      feeAmount: 0.0007,
      destinationJson: JSON.stringify('TTest123456789012345678901234567890'),
      payoutMethod: null,
      payoutDetails: null,
      email: 'test1@example.com',
      payinAddress: generateMockAddress({ code: 'BTC', type: CurrencyType.CRYPTO, network: NetworkType.BTC } as any),
      status: OrderStatus.COMPLETED,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000),
    },
    {
      shortId: generateShortId(),
      fromCurrencyCode: 'ETH',
      toCurrencyCode: 'USDT_ERC20',
      fromNetwork: NetworkType.ETH,
      toNetwork: NetworkType.ETH,
      amountFrom: 1,
      amountTo: 2480,
      rate: 2480,
      feePct: 0.7,
      feeAmount: 0.007,
      destinationJson: JSON.stringify('0xTest123456789012345678901234567890'),
      payoutMethod: null,
      payoutDetails: null,
      email: 'test2@example.com',
      payinAddress: generateMockAddress({ code: 'ETH', type: CurrencyType.CRYPTO, network: NetworkType.ETH } as any),
      status: OrderStatus.WAITING_PAYMENT,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
    {
      shortId: generateShortId(),
      fromCurrencyCode: 'USDT_TRC20',
      toCurrencyCode: 'RUB_SBER',
      fromNetwork: NetworkType.TRON,
      toNetwork: null,
      amountFrom: 1000,
      amountTo: 90000,
      rate: 90,
      feePct: 0.7,
      feeAmount: 7,
      destinationJson: JSON.stringify({ method: 'Sber', details: '1234567890' }),
      payoutMethod: 'Sber',
      payoutDetails: JSON.stringify({ method: 'Sber', details: '1234567890' }),
      payinAddress: generateMockAddress({ code: 'USDT_TRC20', type: CurrencyType.CRYPTO, network: NetworkType.TRON } as any),
      status: OrderStatus.PAID,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
    {
      shortId: generateShortId(),
      fromCurrencyCode: 'BTC',
      toCurrencyCode: 'USD_BANK',
      fromNetwork: NetworkType.BTC,
      toNetwork: null,
      amountFrom: 0.05,
      amountTo: 2250,
      rate: 45000,
      feePct: 0.7,
      feeAmount: 0.00035,
      destinationJson: JSON.stringify({ method: 'Bank transfer', details: 'IBAN: XX123456789' }),
      payoutMethod: 'Bank transfer',
      payoutDetails: JSON.stringify({ method: 'Bank transfer', details: 'IBAN: XX123456789' }),
      payinAddress: generateMockAddress({ code: 'BTC', type: CurrencyType.CRYPTO, network: NetworkType.BTC } as any),
      status: OrderStatus.CREATED,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000),
    },
    {
      shortId: generateShortId(),
      fromCurrencyCode: 'TON',
      toCurrencyCode: 'USDT_TRC20',
      fromNetwork: NetworkType.TON,
      toNetwork: NetworkType.TRON,
      amountFrom: 100,
      amountTo: 250,
      rate: 2.5,
      feePct: 0.7,
      feeAmount: 0.7,
      destinationJson: JSON.stringify('TTest987654321098765432109876543210'),
      payoutMethod: null,
      payoutDetails: null,
      payinAddress: generateMockAddress({ code: 'TON', type: CurrencyType.CRYPTO, network: NetworkType.TON } as any),
      status: OrderStatus.EXPIRED,
      expiresAt: new Date(Date.now() - 60 * 60 * 1000),
    },
  ];

  for (const orderData of testOrders) {
    const order = await prisma.order.upsert({
      where: { shortId: orderData.shortId },
      update: orderData,
      create: orderData,
    });
    
    const existingEvent = await prisma.orderStatusEvent.findFirst({
      where: { orderId: order.id },
    });
    
    if (!existingEvent) {
      await prisma.orderStatusEvent.create({
        data: {
          orderId: order.id,
          fromStatus: null,
          toStatus: order.status,
          actor: StatusActor.USER,
        },
      });
    }
  }

  // Создание PAY-IN кошельков
  const wallets = [
    {
      currencyCode: 'BTC',
      network: 'BTC',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      label: 'Demo BTC wallet #1',
      priority: 10,
    },
    {
      currencyCode: 'ETH',
      network: 'ETH',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      label: 'Demo ETH wallet #1',
      priority: 10,
    },
    {
      currencyCode: 'USDT',
      network: 'TRON',
      address: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf',
      label: 'Demo USDT TRC20 wallet #1',
      priority: 10,
    },
    {
      currencyCode: 'USDT',
      network: 'ETH',
      address: '0x8ba1f109551bD432803012645Hac136c22C929E',
      label: 'Demo USDT ERC20 wallet #1',
      priority: 20,
    },
    {
      currencyCode: 'TON',
      network: 'TON',
      address: 'EQD0vdSA_NedR9uvbgN9EikRX-suesDxGeFg69XQMavfLqIo',
      label: 'Demo TON wallet #1',
      priority: 10,
    },
  ];

  for (const walletData of wallets) {
    const existing = await prisma.payInWallet.findFirst({
      where: {
        currencyCode: walletData.currencyCode,
        network: walletData.network,
        address: walletData.address,
      },
    });

    if (!existing) {
      await prisma.payInWallet.create({
        data: {
          ...walletData,
          isActive: true,
          usageCount: 0,
        },
      });
    }
  }

  console.log('Seeded currencies, pairs, wallets and test orders');
}

// Экспортируем main для использования в других модулях
export default main;

// Если запускается напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
