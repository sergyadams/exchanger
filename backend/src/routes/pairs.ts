import { Router } from 'express';
import { ExchangePairService } from '../services/exchangePairService.js';

const router = Router();
const pairService = new ExchangePairService();

router.get('/', async (req, res) => {
  try {
    const { from } = req.query;
    
    if (from) {
      const pairs = await pairService.getPairsByFrom(from as string);
      res.json({ pairs });
    } else {
      const pairs = await pairService.getAllPairs();
      res.json({ pairs });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pairs' });
  }
});

export { router as pairsRouter };
