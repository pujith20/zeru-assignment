// scripts/fetchData.js

import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { Database } from "../database/Database.js";
import { logger } from "../utils/logger.js";


async function insertDummyData() {
   const db = Database.getInstance();

  try {
    logger.info("Seeding dummy data into eigenlayer.db");

    await db.run(`
      INSERT OR IGNORE INTO restakers (user_address, amount_restaked, validator_address, restaked_at)
      VALUES
        ('0xAa1b2c3d4e5f67890123456789abcdef12345678', 12.34, '0xBb2c3d4e5f67890123456789abcdef1234567890', datetime('now', '-1 days')),
        ('0xCc3d4e5f67890123456789abcdef1234567890aa', 8.56, '0xDd4e5f67890123456789abcdef1234567890aabb', datetime('now', '-2 days'));

      INSERT OR IGNORE INTO validators (operator_id, operator_address, total_delegated_stake, status, commission_rate, created_at, name, description, logo, website)
      VALUES
        ('val1', '0xBb2c3d4e5f67890123456789abcdef1234567890', 100000, 'active', 5, datetime('now', '-100 days'), 'Validator One', 'Reliable node', '', ''),
        ('val2', '0xDd4e5f67890123456789abcdef1234567890aabb', 85000, 'jailed', 7, datetime('now', '-150 days'), 'Validator Two', 'Backup node', '', '');

      INSERT OR IGNORE INTO rewards (id, user_address, amount, validator_address, received_at, transaction_hash, block_number)
      VALUES
        (1, '0xAa1b2c3d4e5f67890123456789abcdef12345678', 1.25, '0xBb2c3d4e5f67890123456789abcdef1234567890', datetime('now', '-1 hours'), '0xHash1', 1234567),
        (2, '0xCc3d4e5f67890123456789abcdef1234567890aa', 0.75, '0xDd4e5f67890123456789abcdef1234567890aabb', datetime('now', '-5 hours'), '0xHash2', 1234568);

      INSERT OR IGNORE INTO slash_events (id, validator_operator_id, slashed_at, amount_slashed, reason, block_number, transaction_hash)
      VALUES
        (1, 'val2', datetime('now', '-10 days'), 20.5, 'Downtime', 1234000, '0xSlashHash');
    `);

    logger.info("Dummy data seeded successfully!");
  } catch (err) {
    logger.error("Failed to seed dummy data", err);
  } finally {
    await db.close();
  }
}

insertDummyData();
