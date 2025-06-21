-- Drop tables if they already exist (optional but recommended for testing)
DROP TABLE IF EXISTS restakers;
DROP TABLE IF EXISTS validators;
DROP TABLE IF EXISTS rewards;
DROP TABLE IF EXISTS slash_events;

-- Create Validators table
CREATE TABLE validators (
  operator_id TEXT PRIMARY KEY,
  operator_address TEXT UNIQUE,
  total_delegated_stake REAL,
  status TEXT,
  commission_rate REAL,
  created_at TEXT,
  name TEXT,
  description TEXT,
  logo TEXT,
  website TEXT
);

-- Create Restakers table
CREATE TABLE restakers (
  user_address TEXT PRIMARY KEY,
  amount_restaked REAL,
  validator_address TEXT,
  restaked_at TEXT
);

-- Create Rewards table
CREATE TABLE rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_address TEXT,
  amount REAL,
  validator_address TEXT,
  received_at TEXT,
  transaction_hash TEXT,
  block_number INTEGER
);

-- Create Slash Events table
CREATE TABLE slash_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  validator_operator_id TEXT,
  slashed_at TEXT,
  amount_slashed REAL,
  reason TEXT,
  block_number INTEGER,
  transaction_hash TEXT
);

-- Insert dummy validators
INSERT INTO validators (operator_id, operator_address, total_delegated_stake, status, commission_rate, created_at, name, description, logo, website)
VALUES 
('val1', '0xValidator1', 100000, 'active', 0.05, '2024-01-01T00:00:00Z', 'Validator One', 'Trusted validator', '', ''),
('val2', '0xValidator2', 200000, 'inactive', 0.10, '2024-02-01T00:00:00Z', 'Validator Two', 'Inactive validator', '', '');

-- Insert dummy restakers (ensure unique user_address)
INSERT OR REPLACE INTO restakers (user_address, amount_restaked, validator_address, restaked_at)
VALUES 
('0x1111111111111111111111111111111111111111', 500, '0xValidator1', '2025-06-01T12:00:00Z'),
('0x2222222222222222222222222222222222222222', 700, '0xValidator2', '2025-06-05T10:00:00Z');

-- Insert dummy rewards
INSERT INTO rewards (user_address, amount, validator_address, received_at, transaction_hash, block_number)
VALUES 
('0x1111111111111111111111111111111111111111', 25.5, '0xValidator1', '2025-06-10T08:00:00Z', '0xTxHash1', 1001),
('0x1111111111111111111111111111111111111111', 30.0, '0xValidator1', '2025-06-15T08:00:00Z', '0xTxHash2', 1002);

-- Insert dummy slash events
INSERT INTO slash_events (validator_operator_id, slashed_at, amount_slashed, reason, block_number, transaction_hash)
VALUES 
('val1', '2025-05-15T00:00:00Z', 10.5, 'Double signing', 999, '0xSlashTxHash1');
