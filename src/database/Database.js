import sqlite3 from 'sqlite3';
import { logger } from '../utils/logger.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '../../data');

// Create data directory if it doesn't exist
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

export class Database {
  static instance = null;

  constructor() {
    this.db = new sqlite3.Database(join(dataDir, 'eigenlayer.db'), (err) => {
      if (err) {
        logger.error('Error opening database:', err);
        throw err;
      }
      logger.info('Connected to SQLite database');
    });

    // Enable foreign keys
    this.db.run('PRAGMA foreign_keys = ON');
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          logger.error('Database run error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          logger.error('Database get error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Database all error:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          logger.error('Error closing database:', err);
          reject(err);
        } else {
          logger.info('Database connection closed');
          resolve();
        }
      });
    });
  }
}