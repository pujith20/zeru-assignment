import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ValidatorsService } from '../services/ValidatorsService.js';

const router = Router();
const validatorsService = new ValidatorsService();

// GET /api/validators - List of validators with their stats
router.get('/', asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, status, minStake } = req.query;
  
  const filters = {
    limit: Math.min(parseInt(limit) || 50, 100),
    offset: parseInt(offset) || 0,
    status: status,
    minStake: minStake ? parseFloat(minStake) : undefined
  };

  const result = await validatorsService.getValidators(filters);
  
  res.json({
    success: true,
    data: result.validators,
    pagination: {
      total: result.total,
      limit: filters.limit,
      offset: filters.offset,
      hasMore: result.total > filters.offset + filters.limit
    },
    meta: {
      totalDelegatedStake: result.totalDelegatedStake,
      statusBreakdown: result.statusBreakdown
    }
  });
}));

// GET /api/validators/:operatorId - Get specific validator info
router.get('/:operatorId', asyncHandler(async (req, res) => {
  const { operatorId } = req.params;
  
  const validator = await validatorsService.getValidatorById(operatorId);
  
  if (!validator) {
    return res.status(404).json({
      error: {
        message: 'Validator not found',
        code: 'VALIDATOR_NOT_FOUND'
      }
    });
  }

  res.json({
    success: true,
    data: validator
  });
}));

// GET /api/validators/:operatorId/slash-history - Get validator slash history
router.get('/:operatorId/slash-history', asyncHandler(async (req, res) => {
  const { operatorId } = req.params;
  
  const slashHistory = await validatorsService.getSlashHistory(operatorId);
  
  res.json({
    success: true,
    data: slashHistory
  });
}));

export { router as validatorsRouter };