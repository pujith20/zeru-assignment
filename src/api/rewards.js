import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { RewardsService } from '../services/RewardsService.js';

const router = Router();
const rewardsService = new RewardsService();

// GET /api/rewards/:address - Reward info for a specific wallet
router.get('/:address', asyncHandler(async (req, res) => {
  const { address } = req.params;
  const { timeframe = '30d', validator } = req.query;
  
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({
      error: {
        message: 'Invalid Ethereum address format',
        code: 'INVALID_ADDRESS'
      }
    });
  }

  const filters = {
    timeframe: timeframe,
    validator: validator
  };

  const rewards = await rewardsService.getRewardsByAddress(address, filters);
  
  if (!rewards) {
    return res.status(404).json({
      error: {
        message: 'No reward data found for this address',
        code: 'REWARDS_NOT_FOUND'
      }
    });
  }

  res.json({
    success: true,
    data: rewards
  });
}));

// GET /api/rewards/:address/breakdown - Detailed reward breakdown by validator
router.get('/:address/breakdown', asyncHandler(async (req, res) => {
  const { address } = req.params;
  const { timeframe = '30d' } = req.query;
  
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({
      error: {
        message: 'Invalid Ethereum address format',
        code: 'INVALID_ADDRESS'
      }
    });
  }

  const breakdown = await rewardsService.getRewardBreakdown(address, timeframe);
  
  res.json({
    success: true,
    data: breakdown
  });
}));

// GET /api/rewards/:address/history - Historical reward data
router.get('/:address/history', asyncHandler(async (req, res) => {
  const { address } = req.params;
  const { limit = 100, offset = 0 } = req.query;
  
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({
      error: {
        message: 'Invalid Ethereum address format',
        code: 'INVALID_ADDRESS'
      }
    });
  }

  const filters = {
    limit: Math.min(parseInt(limit) || 100, 500),
    offset: parseInt(offset) || 0
  };

  const history = await rewardsService.getRewardHistory(address, filters);
  
  res.json({
    success: true,
    data: history.rewards,
    pagination: {
      total: history.total,
      limit: filters.limit,
      offset: filters.offset,
      hasMore: history.total > filters.offset + filters.limit
    }
  });
}));

export { router as rewardsRouter };