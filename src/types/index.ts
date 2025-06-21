// User Restaking Types
export interface Restaker {
  userAddress: string;
  amountRestaked: number;
  validatorAddress: string;
  restakedAt: string;
  validator: {
    operatorId: string;
    totalDelegatedStake: number;
    status: string;
    commissionRate: number;
  };
}

export interface RestakerFilters {
  limit: number;
  offset: number;
  minAmount?: number;
  validator?: string;
}

// Validator Types
export interface Validator {
  operatorId: string;
  operatorAddress: string;
  totalDelegatedStake: number;
  status: 'active' | 'jailed' | 'slashed' | 'inactive';
  commissionRate: number;
  createdAt: string;
  metadata: {
    name: string;
    description: string;
    logo: string;
    website: string;
  };
}

export interface ValidatorFilters {
  limit: number;
  offset: number;
  status?: string;
  minStake?: number;
}

export interface SlashEvent {
  id: string;
  validatorOperatorId: string;
  slashedAt: string;
  amountSlashed: number;
  reason: string;
  blockNumber: number;
  transactionHash: string;
}

// Reward Types
export interface RewardSummary {
  userAddress: string;
  totalRewards: number;
  totalTransactions: number;
  validatorsCount: number;
  timeframe: string;
  periodStart: string;
  periodEnd: string;
}

export interface RewardBreakdown {
  validatorAddress: string;
  validatorName: string;
  operatorId: string;
  totalRewards: number;
  transactionCount: number;
  averageReward: number;
  firstReward: string;
  lastReward: string;
}

export interface RewardEvent {
  id: string;
  amount: number;
  validatorAddress: string;
  validatorName: string;
  operatorId: string;
  receivedAt: string;
  transactionHash: string;
  blockNumber: number;
}

export interface RewardHistory {
  rewards: RewardEvent[];
  total: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code: string;
    timestamp: string;
    path: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}