/**
 * Main application configuration
 */
const path = require('path');

module.exports = {
  // Application settings
  app: {
    name: 'GPU Tracker',
    version: '0.1.0',
    dataDir: path.join(__dirname, '../data'),
    logsDir: path.join(__dirname, '../logs'),
    tempDir: path.join(__dirname, '../temp')
  },
  
  // Scheduler settings
  scheduler: {
    // Run every minute by default
    checkInterval: process.env.CHECK_INTERVAL || '*/1 * * * *',
    // Maximum concurrent product checks
    concurrency: parseInt(process.env.MAX_CONCURRENCY || '3'),
    // Timeout for each product check (in milliseconds)
    checkTimeout: parseInt(process.env.CHECK_TIMEOUT || '30000')
  },
  
  // Browser settings
  browser: {
    // Use the system installed browser or a specific path
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    // Browser launch options
    launchOptions: {
      headless: process.env.BROWSER_HEADLESS !== 'false',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ],
      ignoreHTTPSErrors: true
    },
    // Default viewport settings
    viewport: {
      width: 1920,
      height: 1080
    },
    // Default user agent
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
  },
  
  // Database settings
  database: {
    // SQLite file path (relative to dataDir)
    filename: 'gpu-tracker.db',
    // Log SQL queries in debug mode
    logQueries: process.env.DEBUG_MODE === 'true'
  },
  
  // API server settings
  server: {
    port: parseInt(process.env.PORT || '3000'),
    // CORS settings for the API
    cors: {
      enabled: true,
      origins: ['http://localhost:3000'],
      allowCredentials: true
    },
    // API rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },
  
  // Notification settings
  notifications: {
    // Global settings that apply to all notification types
    global: {
      // Avoid notification flooding by setting cooldown periods
      cooldown: {
        // Send at most one stock notification per product per hour
        stock: 60 * 60 * 1000, // 1 hour in milliseconds
        // Send at most one price notification per product per day
        price: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      }
    }
  },
  
  // Default log level and debug mode
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    debugMode: process.env.DEBUG_MODE === 'true',
    // Log format
    format: 'json',
    // Log files rotation settings
    rotation: {
      maxSize: '5m',
      maxFiles: 5
    }
  }
};