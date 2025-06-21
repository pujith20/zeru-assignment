import { Database } from '../database/Database.js';

export class RewardsService {
  constructor() {
    this.db = Database.getInstance();
  }

  async getRewardsByAddress(address, filters) {
    const { timeframe, validator } = filters;
    const daysBack = this.parseTimeframe(timeframe);
    
    let whereClause = 'user_address = ? AND received_at >= datetime("now", "-' + daysBack + ' days")';
    const params = [address.toLowerCase()];
    
    if (validator) {
      whereClause += ' AND validator_address = ?';
      params.push(validator);
    }

    const query = `
      SELECT 
        SUM(amount) as totalRewards,
        COUNT(*) as totalTransactions,
        COUNT(DISTINCT validator_address) as validatorsCount,
        MIN(received_at) as firstReward,
        MAX(received_at) as lastReward
      FROM rewards 
      WHERE ${whereClause}
    `;
    
    const result = await this.db.get(query, params);
    
    if (!result || result.totalRewards === null) {
      return null;
    }

    return {
      userAddress: address,
      totalRewards: parseFloat(result.totalRewards),
      totalTransactions: result.totalTransactions,
      validatorsCount: result.validatorsCount,
      timeframe,
      periodStart: new Date(result.firstReward).toISOString(),
      periodEnd: new Date(result.lastReward).toISOString()
    };
  }

  async getRewardBreakdown(address, timeframe) {
    const daysBack = this.parseTimeframe(timeframe);
    
    const query = `
      SELECT 
        r.validator_address,
        v.operator_id,
        v.name as validator_name,
        SUM(r.amount) as totalRewards,
        COUNT(r.id) as transactionCount,
        AVG(r.amount) as averageReward,
        MIN(r.received_at) as firstReward,
        MAX(r.received_at) as lastReward
      FROM rewards r
      LEFT JOIN validators v ON r.validator_address = v.operator_address
      WHERE r.user_address = ? AND r.received_at >= datetime("now", "-${daysBack} days")
      GROUP BY r.validator_address
      ORDER BY totalRewards DESC
    `;
    
    const results = await this.db.all(query, [address.toLowerCase()]);
    
    return results.map(row => ({
      validatorAddress: row.validator_address,
      validatorName: row.validator_name || 'Unknown Validator',
      operatorId: row.operator_id,
      totalRewards: parseFloat(row.totalRewards),
      transactionCount: row.transactionCount,
      averageReward: parseFloat(row.averageReward),
      firstReward: new Date(row.firstReward).toISOString(),
      lastReward: new Date(row.lastReward).toISOString()
    }));
  }

  async getRewardHistory(address, filters) {
    const { limit, offset } = filters;
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM rewards 
      WHERE user_address = ?
    `;
    
    const countResult = await this.db.get(countQuery, [address.toLowerCase()]);
    
    // Get paginated results
    const dataQuery = `
      SELECT 
        r.id,
        r.amount,
        r.validator_address,
        r.received_at,
        r.transaction_hash,
        r.block_number,
        v.name as validator_name,
        v.operator_id
      FROM rewards r
      LEFT JOIN validators v ON r.validator_address = v.operator_address
      WHERE r.user_address = ?
      ORDER BY r.received_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const rewards = await this.db.all(dataQuery, [address.toLowerCase(), limit, offset]);
    
    return {
      rewards: rewards.map(this.formatRewardEvent),
      total: countResult.total
    };
  }

  formatRewardEvent(row) {
    return {
      id: row.id,
      amount: parseFloat(row.amount),
      validatorAddress: row.validator_address,
      validatorName: row.validator_name || 'Unknown Validator',
      operatorId: row.operator_id,
      receivedAt: new Date(row.received_at).toISOString(),
      transactionHash: row.transaction_hash,
      blockNumber: row.block_number
    };
  }

  parseTimeframe(timeframe) {
    const timeframes = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
      'all': 3650 // 10 years as "all time"
    };
    
    return timeframes[timeframe] || 30;
  }
}