import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';

export interface PayInWallet {
  id: string;
  currencyCode: string;
  network: string;
  address: string;
  label: string | null;
  isActive: boolean;
  priority: number;
  usageCount: number;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class PayInWalletService {
  async getWalletForOrder(currencyCode: string, network: string | null): Promise<PayInWallet | null> {
    const where: any = {
      currencyCode,
      isActive: true,
    };
    
    if (network) {
      where.network = network;
    } else {
      where.network = null;
    }
    
    const wallets = await prisma.payInWallet.findMany({
      where,
      orderBy: [
        { priority: 'asc' },
        { usageCount: 'asc' },
      ],
      take: 1,
    });

    if (wallets.length === 0) {
      return null;
    }

    const wallet = wallets[0];

    await prisma.payInWallet.update({
      where: { id: wallet.id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    return {
      id: wallet.id,
      currencyCode: wallet.currencyCode,
      network: wallet.network,
      address: wallet.address,
      label: wallet.label,
      isActive: wallet.isActive,
      priority: wallet.priority,
      usageCount: wallet.usageCount + 1,
      lastUsedAt: new Date(),
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  async getAllWallets(filters?: {
    currencyCode?: string;
    network?: string;
    isActive?: boolean;
  }): Promise<PayInWallet[]> {
    const where: any = {};
    if (filters?.currencyCode) {
      where.currencyCode = filters.currencyCode;
    }
    if (filters?.network) {
      where.network = filters.network;
    }
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const wallets = await prisma.payInWallet.findMany({
      where,
      orderBy: [
        { currencyCode: 'asc' },
        { network: 'asc' },
        { priority: 'asc' },
      ],
    });

    return wallets.map((w) => ({
      id: w.id,
      currencyCode: w.currencyCode,
      network: w.network,
      address: w.address,
      label: w.label,
      isActive: w.isActive,
      priority: w.priority,
      usageCount: w.usageCount,
      lastUsedAt: w.lastUsedAt,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }));
  }

  async getWalletById(id: string): Promise<PayInWallet | null> {
    const wallet = await prisma.payInWallet.findUnique({
      where: { id },
    });

    if (!wallet) return null;

    return {
      id: wallet.id,
      currencyCode: wallet.currencyCode,
      network: wallet.network,
      address: wallet.address,
      label: wallet.label,
      isActive: wallet.isActive,
      priority: wallet.priority,
      usageCount: wallet.usageCount,
      lastUsedAt: wallet.lastUsedAt,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  async createWallet(data: {
    currencyCode: string;
    network: string;
    address: string;
    label?: string;
    priority?: number;
    isActive?: boolean;
  }): Promise<PayInWallet> {
    const wallet = await prisma.payInWallet.create({
      data: {
        currencyCode: data.currencyCode,
        network: data.network,
        address: data.address,
        label: data.label || null,
        priority: data.priority || 100,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return {
      id: wallet.id,
      currencyCode: wallet.currencyCode,
      network: wallet.network,
      address: wallet.address,
      label: wallet.label,
      isActive: wallet.isActive,
      priority: wallet.priority,
      usageCount: wallet.usageCount,
      lastUsedAt: wallet.lastUsedAt,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  async updateWallet(
    id: string,
    data: {
      label?: string;
      priority?: number;
      isActive?: boolean;
    }
  ): Promise<PayInWallet> {
    const wallet = await prisma.payInWallet.update({
      where: { id },
      data,
    });

    return {
      id: wallet.id,
      currencyCode: wallet.currencyCode,
      network: wallet.network,
      address: wallet.address,
      label: wallet.label,
      isActive: wallet.isActive,
      priority: wallet.priority,
      usageCount: wallet.usageCount,
      lastUsedAt: wallet.lastUsedAt,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  async deactivateWallet(id: string): Promise<PayInWallet> {
    return this.updateWallet(id, { isActive: false });
  }
}
