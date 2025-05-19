const cron = require('node-cron');
const logger = require('../utils/logger');
const browserManager = require('../scraper/browser');
const retailerModel = require('../db/models/retailer');
const RetailerFactory = require('../retailers/factory');
const AlertManager = require('../notifications/manager');

class Scheduler {
  constructor() {
    this.tasks = new Map();
    this.retailers = [];
    this.alertManager = new AlertManager();
    this.isRunning = false;
  }

  /**
   * Initialize the scheduler with retailers
   */
  async initialize() {
    try {
      logger.info('Initializing scheduler...');
      
      // Load active retailers from database
      const retailerRecords = retailerModel.getActiveRetailers();
      this.retailers = await RetailerFactory.createRetailers(retailerRecords);
      
      // Initialize each retailer
      for (const retailer of this.retailers) {
        await retailer.initialize();
      }

      // Initialize alert manager
      await this.alertManager.initialize();
      
      logger.info(`Scheduler initialized with ${this.retailers.length} retailers`);
      return true;
    } catch (error) {
      logger.error(`Error initializing scheduler: ${error.message}`);
      return false;
    }
  }

  /**
   * Schedule periodic checking of products
   * @param {string} schedule cron schedule expression (default: every minute)
   */
  scheduleChecks(schedule = '* * * * *') {
    if (this.tasks.has('productChecks')) {
      this.tasks.get('productChecks').stop();
    }

    logger.info(`Scheduling product checks with schedule: ${schedule}`);
    
    const task = cron.schedule(schedule, async () => {
      try {
        if (this.isRunning) {
          logger.warn('Previous check still running, skipping this run');
          return;
        }
        
        this.isRunning = true;
        logger.info('Starting scheduled product check...');
        
        // Get browser instance
        const browser = await browserManager.getBrowser();
        
        // Check all retailers
        for (const retailer of this.retailers) {
          try {
            logger.info(`Checking products for ${retailer.name}...`);
            const results = await retailer.checkProducts(browser);
            
            // Process results for notifications
            if (results && results.length > 0) {
              await this.alertManager.processResults(results);
            }
          } catch (error) {
            logger.error(`Error checking retailer ${retailer.name}: ${error.message}`);
          }
        }
        
        logger.info('Scheduled product check completed');
      } catch (error) {
        logger.error(`Error in scheduled product check: ${error.message}`);
      } finally {
        this.isRunning = false;
      }
    });

    this.tasks.set('productChecks', task);
    logger.info('Product check scheduler started');
  }

  /**
   * Run an immediate check of all products
   */
  async runNow() {
    try {
      if (this.isRunning) {
        logger.warn('Check already running, please wait');
        return false;
      }
      
      this.isRunning = true;
      logger.info('Starting manual product check...');
      
      // Get browser instance
      const browser = await browserManager.getBrowser();
      
      const allResults = [];
      
      // Check all retailers
      for (const retailer of this.retailers) {
        try {
          logger.info(`Checking products for ${retailer.name}...`);
          const results = await retailer.checkProducts(browser);
          
          if (results && results.length > 0) {
            allResults.push(...results);
          }
        } catch (error) {
          logger.error(`Error checking retailer ${retailer.name}: ${error.message}`);
        }
      }
      
      // Process results for notifications
      if (allResults.length > 0) {
        await this.alertManager.processResults(allResults);
      }
      
      logger.info('Manual product check completed');
      return true;
    } catch (error) {
      logger.error(`Error in manual product check: ${error.message}`);
      return false;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Stop all scheduled tasks
   */
  stopAll() {
    for (const [name, task] of this.tasks.entries()) {
      logger.info(`Stopping scheduled task: ${name}`);
      task.stop();
    }
    
    // Clear the task map
    this.tasks.clear();
    
    // Close the browser
    browserManager.close().catch(error => {
      logger.error(`Error closing browser: ${error.message}`);
    });
    
    logger.info('All scheduled tasks stopped');
  }
  
  /**
   * Update checking schedule
   */
  updateSchedule(schedule) {
    if (!cron.validate(schedule)) {
      logger.error(`Invalid cron schedule expression: ${schedule}`);
      return false;
    }
    
    this.scheduleChecks(schedule);
    logger.info(`Check schedule updated to: ${schedule}`);
    return true;
  }
  
  /**
   * Add a new retailer at runtime
   */
  async addRetailer(retailerData) {
    try {
      const retailer = await RetailerFactory.createRetailer(retailerData);
      await retailer.initialize();
      this.retailers.push(retailer);
      logger.info(`Added retailer: ${retailer.name}`);
      return true;
    } catch (error) {
      logger.error(`Error adding retailer: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Remove a retailer at runtime
   */
  removeRetailer(retailerId) {
    const index = this.retailers.findIndex(r => r.id === retailerId);
    
    if (index !== -1) {
      const retailer = this.retailers[index];
      this.retailers.splice(index, 1);
      logger.info(`Removed retailer: ${retailer.name}`);
      return true;
    }
    
    logger.warn(`Retailer with ID ${retailerId} not found`);
    return false;
  }
}

module.exports = new Scheduler();
