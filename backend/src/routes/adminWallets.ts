import { Router } from 'express';
import { PayInWalletService } from '../services/payInWalletService.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../utils/prisma.js';

const router = Router();
const walletService = new PayInWalletService();

router.get('/wallets', async (req, res) => {
  try {
    const { currencyCode, network, isActive } = req.query;
    
    const filters: any = {};
    if (currencyCode) filters.currencyCode = currencyCode as string;
    if (network) filters.network = network as string;
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const wallets = await walletService.getAllWallets(filters);
    res.json({ wallets });
  } catch (error) {
    logger.error('Admin get wallets error', error);
    res.status(500).json({ error: 'Не удалось получить кошельки' });
  }
});

router.get('/wallets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const wallet = await walletService.getWalletById(id);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Кошелёк не найден' });
    }
    
    res.json({ wallet });
  } catch (error) {
    logger.error('Admin get wallet error', error);
    res.status(500).json({ error: 'Не удалось получить кошелёк' });
  }
});

router.post('/wallets', async (req, res) => {
  try {
    const { currencyCode, network, address, label, priority, isActive } = req.body;

    if (!currencyCode || !network || !address) {
      return res.status(400).json({ error: 'Необходимы currencyCode, network и address' });
    }

    const existing = await prisma.payInWallet.findFirst({
      where: {
        AND: [
          { currencyCode },
          { network },
          { address },
        ],
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Кошелёк с таким адресом уже существует' });
    }

    const wallet = await walletService.createWallet({
      currencyCode,
      network,
      address,
      label,
      priority,
      isActive,
    });

    res.json({ wallet });
  } catch (error: any) {
    logger.error('Admin create wallet error', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Кошелёк с таким адресом уже существует' });
    }
    res.status(500).json({ error: 'Не удалось создать кошелёк' });
  }
});

router.patch('/wallets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { label, priority, isActive } = req.body;

    const wallet = await walletService.updateWallet(id, {
      label,
      priority,
      isActive,
    });

    res.json({ wallet });
  } catch (error) {
    logger.error('Admin update wallet error', error);
    res.status(500).json({ error: 'Не удалось обновить кошелёк' });
  }
});

router.delete('/wallets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const wallet = await walletService.deactivateWallet(id);
    res.json({ wallet });
  } catch (error) {
    logger.error('Admin delete wallet error', error);
    res.status(500).json({ error: 'Не удалось отключить кошелёк' });
  }
});

export { router as adminWalletsRouter };
