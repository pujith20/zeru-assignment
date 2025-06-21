import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { RestakersService } from '../services/RestakersService.js';

const router = Router();
const restakersService = new RestakersService();

// GET /api/restakers - List of restakers with amount + validator
router.get('/', asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, minAmount, validator } = req.query;
  
  const filters = {
    limit: Math.min(parseInt(limit) || 50, 100), // Cap at 100
    offset: parseInt(offset) || 0,
    minAmount: minAmount ? parseFloat(minAmount) : undefined,
    validator: validator
  };

  const result = await restakersService.getRestakers(filters);
  
  res.json({
    success: true,
    data: result.restakers,
    pagination: {
      total: result.total,
      limit: filters.limit,
      offset: filters.offset,
      hasMore: result.total > filters.offset + filters.limit
    },
    meta: {
      totalStaked: result.totalStaked,
      uniqueValidators: result.uniqueValidators
    }
  });
}));

// GET /api/restakers/:address - Get specific restaker info
router.get('/:address', asyncHandler(async (req, res) => {
  const { address } = req.params;

  // For local dev/testing, relax validation
  if (!address || !address.startsWith('0x')) {
    return res.status(400).json({
      error: {
        message: 'Invalid address format (must start with 0x)',
        code: 'INVALID_ADDRESS'
      }
    });
  }

  const restaker = await restakersService.getRestakerByAddress(address);

  if (!restaker) {
    return res.status(404).json({
      error: {
        message: 'Restaker not found',
        code: 'RESTAKER_NOT_FOUND'
      }
    });
  }

  res.json({
    success: true,
    data: restaker
  });
}));

export { router as restakersRouter };