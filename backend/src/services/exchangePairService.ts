import { PrismaClient } from '@prisma/client';
import { RateSource, type ExchangePair } from '@exchanger/shared';
import { prisma } from '../utils/prisma.js';

export class ExchangePairService {
  async getAllPairs(): Promise<ExchangePair[]> {
    const pairs = await prisma.exchangePair.findMany({
      where: { enabled: true },
      include: {
        fromCurrency: true,
        toCurrency: true,
      },
    });

    return pairs.map((p) => ({
      fromCurrencyCode: p.fromCurrencyCode,
      toCurrencyCode: p.toCurrencyCode,
      enabled: p.enabled,
      feePct: Number(p.feePct),
      rateSource: p.rateSource as RateSource,
      notes: p.notes || undefined,
    }));
  }

  async getPairsByFrom(fromCurrencyCode: string): Promise<ExchangePair[]> {
    const pairs = await prisma.exchangePair.findMany({
      where: {
        fromCurrencyCode,
        enabled: true,
      },
      include: {
        toCurrency: true,
      },
    });

    return pairs
      .filter((p) => p.toCurrency && p.toCurrency.enabled)
      .map((p) => ({
        fromCurrencyCode: p.fromCurrencyCode,
        toCurrencyCode: p.toCurrencyCode,
        enabled: p.enabled,
        feePct: Number(p.feePct),
        rateSource: p.rateSource as RateSource,
        notes: p.notes || undefined,
      }));
  }

  async getPair(
    fromCurrencyCode: string,
    toCurrencyCode: string
  ): Promise<ExchangePair | null> {
    const pair = await prisma.exchangePair.findUnique({
      where: {
        fromCurrencyCode_toCurrencyCode: {
          fromCurrencyCode,
          toCurrencyCode,
        },
      },
    });

    if (!pair || !pair.enabled) return null;

    return {
      fromCurrencyCode: pair.fromCurrencyCode,
      toCurrencyCode: pair.toCurrencyCode,
      enabled: pair.enabled,
      feePct: Number(pair.feePct),
      rateSource: pair.rateSource as RateSource,
      notes: pair.notes || undefined,
    };
  }
}
