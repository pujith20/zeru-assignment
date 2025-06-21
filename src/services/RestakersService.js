import { Database } from '../database/Database.js';

export class RestakersService {
  constructor() {
    this.db = Database.getInstance();
  }

  async getRestakers(filters) {
    const { limit, offset, minAmount, validator } = filters;
    
    let whereClause = '1=1';
    const params = [];
    
    if (minAmount !== undefined) {
      whereClause += ' AND amount_restaked >= ?';
      params.push(minAmount);
    }
    
    if (validator) {
      whereClause += ' AND validator_address = ?';
      params.push(validator);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total,
             SUM(amount_restaked) as totalStaked,
             COUNT(DISTINCT validator_address) as uniqueValidators
      FROM restakers 
      WHERE ${whereClause}
    `;
    
    const countResult = await this.db.get(countQuery, params);
    
    // Get paginated results
    const dataQuery = `
      SELECT 
        r.user_address,
        r.amount_restaked,
        r.validator_address,
        r.restaked_at,
        v.operator_id,
        v.total_delegated_stake,
        v.status as validator_status
      FROM restakers r
      LEFT JOIN validators v ON r.validator_address = v.operator_address
      WHERE ${whereClause}
      ORDER BY r.amount_restaked DESC, r.restaked_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const restakers = await this.db.all(dataQuery, [...params, limit, offset]);
    
    return {
      restakers: restakers.map(this.formatRestaker),
      total: countResult.total,
      totalStaked: countResult.totalStaked || 0,
      uniqueValidators: countResult.uniqueValidators || 0
    };
  }

  async getRestakerByAddress(address) {
    const query = `
      SELECT 
        r.user_address,
        r.amount_restaked,
        r.validator_address,
        r.restaked_at,
        v.operator_id,
        v.total_delegated_stake,
        v.status as validator_status,
        v.commission_rate
      FROM restakers r
      LEFT JOIN validators v ON r.validator_address = v.operator_address
      WHERE r.user_address = ?
    `;
    
    const result = await this.db.get(query, [address.toLowerCase()]);
    
    return result ? this.formatRestaker(result) : null;
  }

  formatRestaker(row) {
    return {
      userAddress: row.user_address,
      amountRestaked: parseFloat(row.amount_restaked),
      validatorAddress: row.validator_address,
      restakedAt: new Date(row.restaked_at).toISOString(),
      validator: {
        operatorId: row.operator_id,
        totalDelegatedStake: parseFloat(row.total_delegated_stake || 0),
        status: row.validator_status,
        commissionRate: parseFloat(row.commission_rate || 0)
      }
    };
  }
}