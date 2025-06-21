import { Database } from './Database.js';
import { logger } from '../utils/logger.js';

export async function initializeDatabase() {
  const db = Database.getInstance();
  
  try {
    // Create restakers table
    await db.run(`
      CREATE TABLE IF NOT EXISTS restakers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_address TEXT NOT NULL,
        amount_restaked REAL NOT NULL,
        validator_address TEXT NOT NULL,
        restaked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_address, validator_address)
      )
    `);

    // Create validators table
    await db.run(`
      CREATE TABLE IF NOT EXISTS validators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operator_id TEXT UNIQUE NOT NULL,
        operator_address TEXT UNIQUE NOT NULL,
        total_delegated_stake REAL DEFAULT 0,
        status TEXT DEFAULT 'active',
        commission_rate REAL DEFAULT 0.05,
        name TEXT,
        description TEXT,
        logo TEXT,
        website TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create slash_events table
    await db.run(`
      CREATE TABLE IF NOT EXISTS slash_events (
        id TEXT PRIMARY KEY,
        validator_operator_id TEXT NOT NULL,
        slashed_at DATETIME NOT NULL,
        amount_slashed REAL NOT NULL,
        reason TEXT,
        block_number INTEGER,
        transaction_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (validator_operator_id) REFERENCES validators (operator_id)
      )
    `);

    // Create rewards table
    await db.run(`
      CREATE TABLE IF NOT EXISTS rewards (
        id TEXT PRIMARY KEY,
        user_address TEXT NOT NULL,
        validator_address TEXT NOT NULL,
        amount REAL NOT NULL,
        received_at DATETIME NOT NULL,
        transaction_hash TEXT,
        block_number INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await db.run('CREATE INDEX IF NOT EXISTS idx_restakers_user_address ON restakers(user_address)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_restakers_validator_address ON restakers(validator_address)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_restakers_amount ON restakers(amount_restaked)');
    
    await db.run('CREATE INDEX IF NOT EXISTS idx_validators_status ON validators(status)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_validators_stake ON validators(total_delegated_stake)');
    
    await db.run('CREATE INDEX IF NOT EXISTS idx_rewards_user_address ON rewards(user_address)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_rewards_validator_address ON rewards(validator_address)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_rewards_received_at ON rewards(received_at)');
    
    await db.run('CREATE INDEX IF NOT EXISTS idx_slash_events_validator ON slash_events(validator_operator_id)');

    logger.info('Database tables and indexes created successfully');
    
    // Seed with initial data
    await seedInitialData(db);
    
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
}

async function seedInitialData(db) {
  // Check if data already exists
  const existingValidators = await db.get('SELECT COUNT(*) as count FROM validators');
  
  if (existingValidators.count > 0) {
    logger.info('Database already contains data, skipping seed');
    return;
  }

  logger.info('Seeding initial data...');
  
  // Sample validators
  const validators = [
    {
      operator_id: 'val_001',
      operator_address: '0x1234567890abcdef1234567890abcdef12345678',
      total_delegated_stake: 15000.5,
      status: 'active',
      commission_rate: 0.05,
      name: 'EigenLayer Pro Validator',
      description: 'Professional validator with 99.9% uptime',
      logo: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=64',
      website: 'https://eigenvalidator.com'
    },
    {
      operator_id: 'val_002', 
      operator_address: '0x2345678901bcdef12345678901bcdef123456789',
      total_delegated_stake: 8750.25,
      status: 'active',
      commission_rate: 0.07,
      name: 'Secure Stake Validator',
      description: 'Security-focused validator with institutional backing',
      logo: 'https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg?auto=compress&cs=tinysrgb&w=64',
      website: 'https://securestake.io'
    },
    {
      operator_id: 'val_003',
      operator_address: '0x3456789012cdef123456789012cdef12345678901',
      total_delegated_stake: 12300.75,
      status: 'jailed',
      commission_rate: 0.04,
      name: 'Lightning Validator',
      description: 'High-performance validator with cutting-edge infrastructure',
      logo: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=64',
      website: 'https://lightningval.com'
    },
    {
      operator_id: 'val_004',
      operator_address: '0x4567890123def1234567890123def123456789012',
      total_delegated_stake: 9800.0,
      status: 'active',
      commission_rate: 0.06,
      name: 'Decentralized Validator Network',
      description: 'Community-driven validator with transparent operations',
      logo: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=64',
      website: 'https://dvn.network'
    },
    {
      operator_id: 'val_005',
      operator_address: '0x567890123def4567890123def4567890123456789',
      total_delegated_stake: 6500.5,
      status: 'slashed',
      commission_rate: 0.08,
      name: 'Enterprise Validator Solutions',
      description: 'Enterprise-grade validator infrastructure',
      logo: 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg?auto=compress&cs=tinysrgb&w=64',
      website: 'https://evs.com'
    }
  ];

  for (const validator of validators) {
    await db.run(`
      INSERT INTO validators (operator_id, operator_address, total_delegated_stake, status, commission_rate, name, description, logo, website)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      validator.operator_id,
      validator.operator_address,
      validator.total_delegated_stake,
      validator.status,
      validator.commission_rate,
      validator.name,
      validator.description,
      validator.logo,
      validator.website
    ]);
  }

  // Sample restakers
  const restakers = [
    {
      user_address: '0xabcdef1234567890abcdef1234567890abcdef12',
      amount_restaked: 500.0,
      validator_address: '0x1234567890abcdef1234567890abcdef12345678'
    },
    {
      user_address: '0xbcdef1234567890abcdef1234567890abcdef123',
      amount_restaked: 1250.5,
      validator_address: '0x2345678901bcdef12345678901bcdef123456789'
    },
    {
      user_address: '0xcdef1234567890abcdef1234567890abcdef1234',
      amount_restaked: 750.25,
      validator_address: '0x1234567890abcdef1234567890abcdef12345678'
    },
    {
      user_address: '0xdef1234567890abcdef1234567890abcdef12345',
      amount_restaked: 2000.0,
      validator_address: '0x3456789012cdef123456789012cdef12345678901'
    },
    {
      user_address: '0xef1234567890abcdef1234567890abcdef123456',
      amount_restaked: 875.75,
      validator_address: '0x4567890123def1234567890123def123456789012'
    },
    {
      user_address: '0xf1234567890abcdef1234567890abcdef1234567',
      amount_restaked: 1500.0,
      validator_address: '0x2345678901bcdef12345678901bcdef123456789'
    }
  ];

  for (const restaker of restakers) {
    await db.run(`
      INSERT OR IGNORE INTO restakers (user_address, amount_restaked, validator_address)
      VALUES (?, ?, ?)
    `, [restaker.user_address, restaker.amount_restaked, restaker.validator_address]);
  }

  // Sample rewards
  const rewards = [
    {
      id: 'reward_001',
      user_address: '0xabcdef1234567890abcdef1234567890abcdef12',
      validator_address: '0x1234567890abcdef1234567890abcdef12345678',
      amount: 2.5,
      received_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      transaction_hash: '0xreward1hash',
      block_number: 18500000
    },
    {
      id: 'reward_002',
      user_address: '0xbcdef1234567890abcdef1234567890abcdef123',
      validator_address: '0x2345678901bcdef12345678901bcdef123456789',
      amount: 5.25,
      received_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      transaction_hash: '0xreward2hash',
      block_number: 18500100
    },
    {
      id: 'reward_003',
      user_address: '0xcdef1234567890abcdef1234567890abcdef1234',
      validator_address: '0x1234567890abcdef1234567890abcdef12345678',
      amount: 3.75,
      received_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      transaction_hash: '0xreward3hash',
      block_number: 18500200
    },
    {
      id: 'reward_004',
      user_address: '0xdef1234567890abcdef1234567890abcdef12345',
      validator_address: '0x3456789012cdef123456789012cdef12345678901',
      amount: 8.0,
      received_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      transaction_hash: '0xreward4hash',
      block_number: 18500300
    }
  ];

  for (const reward of rewards) {
    await db.run(`
      INSERT OR IGNORE INTO rewards (id, user_address, validator_address, amount, received_at, transaction_hash, block_number)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [reward.id, reward.user_address, reward.validator_address, reward.amount, reward.received_at, reward.transaction_hash, reward.block_number]);
  }

  // Sample slash events
  const slashEvents = [
    {
      id: 'slash_001',
      validator_operator_id: 'val_003',
      slashed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      amount_slashed: 100.0,
      reason: 'Double signing violation',
      block_number: 18480000,
      transaction_hash: '0xslash1hash'
    },
    {
      id: 'slash_002',
      validator_operator_id: 'val_005',
      slashed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      amount_slashed: 250.0,
      reason: 'Downtime penalty',
      block_number: 18470000,
      transaction_hash: '0xslash2hash'
    }
  ];

  for (const slashEvent of slashEvents) {
    await db.run(`
      INSERT OR IGNORE INTO slash_events (id, validator_operator_id, slashed_at, amount_slashed, reason, block_number, transaction_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      slashEvent.id,
      slashEvent.validator_operator_id,
      slashEvent.slashed_at,
      slashEvent.amount_slashed,
      slashEvent.reason,
      slashEvent.block_number,
      slashEvent.transaction_hash
    ]);
  }

  logger.info('Initial data seeded successfully');
}