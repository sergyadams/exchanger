import { Router } from 'express';
import { OrderStatus, StatusActor } from '@exchanger/shared';
import { logger } from '../utils/logger.js';
import { prisma } from '../utils/prisma.js';

const router = Router();

router.get('/orders', async (req, res) => {
  try {
    const { status, q, page = '1', currency } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const pageSize = 20;
    const skip = (pageNum - 1) * pageSize;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (currency) {
      where.OR = [
        { fromCurrencyCode: currency as string },
        { toCurrencyCode: currency as string },
      ];
    }
    if (q) {
      const searchTerm = q as string;
      where.OR = [
        { shortId: { contains: searchTerm } },
        { id: { contains: searchTerm } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          fromCurrency: true,
          toCurrency: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: {
        page: pageNum,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    logger.error('Admin get orders error', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/orders/:id', async (req, res) => {
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
      fromCurrency: order.fromCurrency,
      toCurrency: order.toCurrency,
    });
  } catch (error) {
    logger.error('Admin get order error', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const oldStatus = order.status;
    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        adminNote: adminNote || order.adminNote,
      },
    });

    await prisma.orderStatusEvent.create({
      data: {
        orderId: order.id,
        fromStatus: oldStatus,
        toStatus: status,
        actor: StatusActor.ADMIN,
        note: adminNote,
      },
    });

    res.json(updated);
  } catch (error) {
    logger.error('Admin update status error', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export { router as adminRouter };
