require('dotenv').config();
const logger = require('./utils/logger');
const scheduler = require('./scheduler');
const { initDatabase } = require('./db/migrations/init');
const express = require('express');
const path = require('path');

// Optional, add a simple http server for future API/UI
const app = express();
const PORT = process.env.PORT || 3000;

// Create a class to manage the application
class GpuTrackerApp {
  constructor() {
    this.scheduler = scheduler;
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      logger.info('Initializing GPU Tracker application...');
      
      // Initialize the database
      initDatabase();
      
      // Initialize the scheduler
      await this.scheduler.initialize();
      
      // Set up a basic HTTP server for future API/UI
      this.configureServer();
      
      this.isInitialized = true;
      logger.info('GPU Tracker application initialized successfully');
      
      return true;
    } catch (error) {
      logger.error(`Error initializing application: ${error.message}`);
      return false;
    }
  }

  /**
   * Configure the HTTP server
   */
  configureServer() {
    // Parse JSON request body
    app.use(express.json());
    
    // Serve static files (for future UI)
    app.use(express.static(path.join(__dirname, '../public')));
    
    // Define routes
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        initialized: this.isInitialized,
        uptime: process.uptime()
      });
    });
    
    // API route to trigger manual check
    app.post('/api/check', async (req, res) => {
      if (!this.isInitialized) {
        return res.status(503).json({ error: 'Application not initialized' });
      }
      
      const success = await this.scheduler.runNow();
      
      if (success) {
        res.json({ status: 'ok', message: 'Manual check started' });
      } else {
        res.status(409).json({ error: 'Check already in progress' });
      }
    });
    
    // Start the server
    app.listen(PORT, () => {
      logger.info(`HTTP server listening on port ${PORT}`);
    });
  }

  /**
   * Start the application
   */
  async start() {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize application');
        }
      }
      
      logger.info('Starting GPU Tracker application...');
      
      // Start the scheduler
      const checkInterval = process.env.CHECK_INTERVAL || '*/1 * * * *'; // Default: every minute
      this.scheduler.scheduleChecks(checkInterval);
      
      logger.info(`GPU Tracker application started with check interval: ${checkInterval}`);
      
      return true;
    } catch (error) {
      logger.error(`Error starting application: ${error.message}`);
      return false;
    }
  }

  /**
   * Stop the application
   */
  async stop() {
    try {
      logger.info('Stopping GPU Tracker application...');
      
      // Stop all scheduled tasks
      this.scheduler.stopAll();
      
      logger.info('GPU Tracker application stopped');
      
      return true;
    } catch (error) {
      logger.error(`Error stopping application: ${error.message}`);
      return false;
    }
  }
}

// Create and export the application instance
const gpuTracker = new GpuTrackerApp();

// If this script is run directly, start the application
if (require.main === module) {
  // Handle shutdown signals
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT. Shutting down...');
    await gpuTracker.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM. Shutting down...');
    await gpuTracker.stop();
    process.exit(0);
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error(`Uncaught exception: ${error.message}`);
    logger.error(error.stack);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection:', reason);
  });
  
  // Start the application
  gpuTracker.start().catch((error) => {
    logger.error(`Failed to start application: ${error.message}`);
    process.exit(1);
  });
}

module.exports = gpuTracker;
