import { PrismaClient } from '@prisma/client';
import { CurrencyType, NetworkType, type Currency } from '@exchanger/shared';
import { prisma } from '../utils/prisma.js';

export class CurrencyService {
  async getAllCurrencies(): Promise<Currency[]> {
    try {
      const currencies = await prisma.currency.findMany({
        where: { enabled: true },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
      });

      return currencies.map((c) => ({
        code: c.code,
        name: c.name,
        type: c.type as CurrencyType,
        network: c.network as NetworkType | null,
        isManual: c.isManual,
        precision: c.precision,
        minAmount: Number(c.minAmount),
        maxAmount: Number(c.maxAmount),
        enabled: c.enabled,
      }));
    } catch (error: any) {
      // Если база данных пустая или не инициализирована, возвращаем пустой массив
      if (error?.code === 'P2002' || error?.code === 'P2025' || error?.message?.includes('does not exist')) {
        return [];
      }
      throw error;
    }
  }

  async getCurrency(code: string): Promise<Currency | null> {
    const currency = await prisma.currency.findUnique({
      where: { code },
    });

    if (!currency) return null;

    return {
      code: currency.code,
      name: currency.name,
      type: currency.type as CurrencyType,
      network: currency.network as NetworkType | null,
      isManual: currency.isManual,
      precision: currency.precision,
      minAmount: Number(currency.minAmount),
      maxAmount: Number(currency.maxAmount),
      enabled: currency.enabled,
    };
  }

  async getCurrenciesByType(type: CurrencyType): Promise<Currency[]> {
    const currencies = await prisma.currency.findMany({
      where: { type, enabled: true },
      orderBy: { name: 'asc' },
    });

    return currencies.map((c) => ({
      code: c.code,
      name: c.name,
      type: c.type as CurrencyType,
      network: c.network as NetworkType | null,
      isManual: c.isManual,
      precision: c.precision,
      minAmount: Number(c.minAmount),
      maxAmount: Number(c.maxAmount),
      enabled: c.enabled,
    }));
  }
}
