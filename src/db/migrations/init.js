const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('../../utils/logger');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'gpu-tracker.db');
const db = new Database(dbPath);

logger.info(`Initializing database at ${dbPath}`);

// Enable foreign keys
db.pragma('foreign_keys = ON');

function initDatabase() {
  // Create retailers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS retailers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create brands table
  db.exec(`
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create gpu_models table
  db.exec(`
    CREATE TABLE IF NOT EXISTS gpu_models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      model_number TEXT,
      chip_manufacturer TEXT NOT NULL, 
      chip_model TEXT NOT NULL,
      memory_size INTEGER,
      memory_type TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (brand_id) REFERENCES brands (id),
      UNIQUE (brand_id, model_number)
    )
  `);

  // Create products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      retailer_id INTEGER NOT NULL,
      gpu_model_id INTEGER NOT NULL,
      product_url TEXT NOT NULL,
      product_id TEXT NOT NULL,
      title TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (retailer_id) REFERENCES retailers (id),
      FOREIGN KEY (gpu_model_id) REFERENCES gpu_models (id),
      UNIQUE (retailer_id, product_id)
    )
  `);

  // Create price_history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      price REAL NOT NULL,
      in_stock BOOLEAN NOT NULL,
      checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id)
    )
  `);

  // Create notification_channels table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notification_channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      config TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (type, name)
    )
  `);

  // Create alerts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      gpu_model_id INTEGER,
      retailer_id INTEGER,
      alert_type TEXT NOT NULL,
      price_threshold REAL,
      notification_channel_id INTEGER NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id),
      FOREIGN KEY (gpu_model_id) REFERENCES gpu_models (id),
      FOREIGN KEY (retailer_id) REFERENCES retailers (id),
      FOREIGN KEY (notification_channel_id) REFERENCES notification_channels (id)
    )
  `);

  logger.info('Database initialization completed');
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initDatabase();
  process.exit(0);
} else {
  // Export for use in other modules
  module.exports = { db, initDatabase };
}
