import { Database } from '../database/Database.js';

export class ValidatorsService {
  constructor() {
    this.db = Database.getInstance();
  }

  async getValidators(filters) {
    const { limit, offset, status, minStake } = filters;
    
    let whereClause = '1=1';
    const params = [];
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    if (minStake !== undefined) {
      whereClause += ' AND total_delegated_stake >= ?';
      params.push(minStake);
    }

    // Get aggregated stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(total_delegated_stake) as totalDelegatedStake,
        status,
        COUNT(*) as count
      FROM validators 
      WHERE ${whereClause}
      GROUP BY status
    `;
    
    const statsResults = await this.db.all(statsQuery, params);
    const total = statsResults.reduce((sum, row) => sum + row.count, 0);
    const totalDelegatedStake = statsResults.reduce((sum, row) => sum + parseFloat(row.totalDelegatedStake || 0), 0);
    const statusBreakdown = statsResults.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {});
    
    // Get paginated results
    const dataQuery = `
      SELECT * FROM validators 
      WHERE ${whereClause}
      ORDER BY total_delegated_stake DESC, created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const validators = await this.db.all(dataQuery, [...params, limit, offset]);
    
    return {
      validators: validators.map(this.formatValidator),
      total,
      totalDelegatedStake,
      statusBreakdown
    };
  }

  async getValidatorById(operatorId) {
    const query = `
      SELECT * FROM validators 
      WHERE operator_id = ? OR operator_address = ?
    `;
    
    const result = await this.db.get(query, [operatorId, operatorId]);
    
    return result ? this.formatValidator(result) : null;
  }

  async getSlashHistory(operatorId) {
    const query = `
      SELECT * FROM slash_events 
      WHERE validator_operator_id = ? 
      ORDER BY slashed_at DESC
    `;
    
    const events = await this.db.all(query, [operatorId]);
    
    return events.map(event => ({
      id: event.id,
      validatorOperatorId: event.validator_operator_id,
      slashedAt: new Date(event.slashed_at).toISOString(),
      amountSlashed: parseFloat(event.amount_slashed),
      reason: event.reason,
      blockNumber: event.block_number,
      transactionHash: event.transaction_hash
    }));
  }

  formatValidator(row) {
    return {
      operatorId: row.operator_id,
      operatorAddress: row.operator_address,
      totalDelegatedStake: parseFloat(row.total_delegated_stake),
      status: row.status,
      commissionRate: parseFloat(row.commission_rate),
      createdAt: new Date(row.created_at).toISOString(),
      metadata: {
        name: row.name,
        description: row.description,
        logo: row.logo,
        website: row.website
      }
    };
  }
}