import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  OrderStatus,
  StatusActor,
  ORDER_EXPIRY_MINUTES,
  DEFAULT_FEE_PERCENT,
  type CreateOrderRequest,
} from '@exchanger/shared';
import { getRates, getRate } from '../utils/rateProvider.js';
import { generateMockAddress } from '../utils/addressGenerator.js';
import { generateShortId } from '../utils/shortId.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../utils/prisma.js';
import { CurrencyService } from '../services/currencyService.js';
import { ExchangePairService } from '../services/exchangePairService.js';
import { PayInWalletService } from '../services/payInWalletService.js';

const router = Router();
const currencyService = new CurrencyService();
const pairService = new ExchangePairService();
const payInWalletService = new PayInWalletService();

const createOrderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many orders created, please try again later.',
});

const calculateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
});

router.post('/calculate', calculateLimiter, async (req, res) => {
  try {
    const { fromCurrencyCode, toCurrencyCode, amountFrom } = req.body;

    if (!fromCurrencyCode || !toCurrencyCode || !amountFrom) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (fromCurrencyCode === toCurrencyCode) {
      return res.status(400).json({ error: 'From and to currencies cannot be the same' });
    }

    const fromCurrency = await currencyService.getCurrency(fromCurrencyCode);
    const toCurrency = await currencyService.getCurrency(toCurrencyCode);

    if (!fromCurrency || !toCurrency) {
      return res.status(400).json({ error: 'Invalid currency' });
    }

    if (!fromCurrency.enabled || !toCurrency.enabled) {
      return res.status(400).json({ error: 'Currency is disabled' });
    }

    const pair = await pairService.getPair(fromCurrencyCode, toCurrencyCode);
    if (!pair) {
      return res.status(400).json({ error: 'Exchange pair not available' });
    }

    if (amountFrom < fromCurrency.minAmount || amountFrom > fromCurrency.maxAmount) {
      return res.status(400).json({ 
        error: `Amount must be between ${fromCurrency.minAmount} and ${fromCurrency.maxAmount}` 
      });
    }

    const rates = await getRates();
    const rate = getRate(fromCurrency, toCurrency, rates, pair.rateSource);
    const feeAmount = (amountFrom * pair.feePct) / 100;
    const amountTo = (amountFrom - feeAmount) * rate;

    res.json({
      rate,
      feePct: pair.feePct,
      feeAmount,
      amountTo: Number(amountTo.toFixed(toCurrency.precision)),
      expiresInSeconds: ORDER_EXPIRY_MINUTES * 60,
      rateSource: pair.rateSource,
      updatedAt: new Date(rates.updatedAt).toISOString(),
    });
  } catch (error) {
    logger.error('Calculate error', error);
    res.status(500).json({ error: 'Failed to calculate exchange' });
  }
});

router.post('/create', createOrderLimiter, async (req, res) => {
  try {
    const body: CreateOrderRequest = req.body;

    if (body.fromCurrencyCode === body.toCurrencyCode) {
      return res.status(400).json({ error: 'From and to currencies cannot be the same' });
    }

    const fromCurrency = await currencyService.getCurrency(body.fromCurrencyCode);
    const toCurrency = await currencyService.getCurrency(body.toCurrencyCode);

    if (!fromCurrency || !toCurrency) {
      return res.status(400).json({ error: 'Invalid currency' });
    }

    if (!fromCurrency.enabled || !toCurrency.enabled) {
      return res.status(400).json({ error: 'Currency is disabled' });
    }

    const pair = await pairService.getPair(body.fromCurrencyCode, body.toCurrencyCode);
    if (!pair) {
      return res.status(400).json({ error: 'Exchange pair not available' });
    }

    if (body.amountFrom < fromCurrency.minAmount || body.amountFrom > fromCurrency.maxAmount) {
      return res.status(400).json({ 
        error: `Amount must be between ${fromCurrency.minAmount} and ${fromCurrency.maxAmount}` 
      });
    }

    const rates = await getRates();
    const rate = getRate(fromCurrency, toCurrency, rates, pair.rateSource);
    const feeAmount = (body.amountFrom * pair.feePct) / 100;
    const amountTo = (body.amountFrom - feeAmount) * rate;

    const shortId = generateShortId();
    
    const payInWallet = await payInWalletService.getWalletForOrder(
      body.fromCurrencyCode,
      fromCurrency.network
    );

    if (!payInWallet) {
      return res.status(503).json({ 
        error: 'Нет доступных кошельков для приёма. Попробуйте позже.' 
      });
    }

    const payinAddress = payInWallet.address;
    const expiresAt = new Date(Date.now() + ORDER_EXPIRY_MINUTES * 60 * 1000);

    let destinationJson: string;
    let payoutMethod: string | null = null;
    let payoutDetails: string | null = null;

    if (typeof body.destination === 'string') {
      destinationJson = body.destination;
    } else {
      destinationJson = JSON.stringify(body.destination);
      payoutMethod = body.destination.method;
      payoutDetails = JSON.stringify(body.destination);
    }

    const order = await prisma.order.create({
      data: {
        shortId,
        fromCurrencyCode: body.fromCurrencyCode,
        toCurrencyCode: body.toCurrencyCode,
        fromNetwork: fromCurrency.network,
        toNetwork: toCurrency.network,
        amountFrom: body.amountFrom,
        amountTo,
        rate,
        feePct: pair.feePct,
        feeAmount,
        destinationJson,
        payoutMethod,
        payoutDetails,
        email: body.email,
        payinAddress,
        payinWalletId: payInWallet.id,
        status: OrderStatus.CREATED,
        expiresAt,
      },
    });

    await prisma.orderStatusEvent.create({
      data: {
        orderId: order.id,
        fromStatus: null,
        toStatus: OrderStatus.CREATED,
        actor: StatusActor.USER,
      },
    });

    res.json({
      orderId: order.id,
      shortId: order.shortId,
      payinAddress: order.payinAddress,
      payinQrData: `${fromCurrency.network?.toLowerCase() || 'crypto'}:${order.payinAddress}`,
      expiresAt: order.expiresAt.toISOString(),
      status: order.status,
    });
  } catch (error) {
    logger.error('Create order error', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.post('/:id/mark-sent', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== OrderStatus.CREATED) {
      return res.status(400).json({ error: 'Order cannot be marked as sent' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: OrderStatus.WAITING_PAYMENT },
    });

    await prisma.orderStatusEvent.create({
      data: {
        orderId: order.id,
        fromStatus: OrderStatus.CREATED,
        toStatus: OrderStatus.WAITING_PAYMENT,
        actor: StatusActor.USER,
      },
    });

    res.json(updated);
  } catch (error) {
    logger.error('Mark sent error', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        statusEvents: {
          orderBy: { changedAt: 'asc' },
        },
        fromCurrency: true,
        toCurrency: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== OrderStatus.EXPIRED && new Date(order.expiresAt) < new Date()) {
      await prisma.order.update({
        where: { id },
        data: { status: OrderStatus.EXPIRED },
      });
      await prisma.orderStatusEvent.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: OrderStatus.EXPIRED,
          actor: StatusActor.USER,
        },
      });
      order.status = OrderStatus.EXPIRED;
    }

    let destinationJson;
    try {
      destinationJson = JSON.parse(order.destinationJson);
    } catch {
      destinationJson = order.destinationJson;
    }

    res.json({
      id: order.id,
      shortId: order.shortId,
      fromCurrencyCode: order.fromCurrencyCode,
      toCurrencyCode: order.toCurrencyCode,
      fromNetwork: order.fromNetwork,
      toNetwork: order.toNetwork,
      amountFrom: order.amountFrom,
      amountTo: order.amountTo,
      rate: order.rate,
      feePct: order.feePct,
      feeAmount: order.feeAmount,
      destinationJson,
      payoutMethod: order.payoutMethod,
      payoutDetails: order.payoutDetails,
      email: order.email,
      payinAddress: order.payinAddress,
      status: order.status,
      expiresAt: order.expiresAt.toISOString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      adminNote: order.adminNote,
      timeline: order.statusEvents,
    });
  } catch (error) {
    logger.error('Get order error', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

export { router as exchangeRouter };
