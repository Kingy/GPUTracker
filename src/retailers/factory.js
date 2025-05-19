const logger = require('../utils/logger');
const BestBuyRetailer = require('./bestbuy');
const AmazonRetailer = require('./amazon');

/**
 * Factory class for creating retailer instances
 */
class RetailerFactory {
  /**
   * Creates a retailer instance based on the retailer type
   */
  static async createRetailer(retailerData) {
    const { name } = retailerData;
    
    logger.debug(`Creating retailer instance for: ${name}`);
    
    switch (name.toLowerCase()) {
      case 'bestbuy':
        return new BestBuyRetailer(retailerData);
      
      case 'amazon':
        return new AmazonRetailer(retailerData);
      
      default:
        throw new Error(`Unsupported retailer type: ${name}`);
    }
  }

  /**
   * Creates multiple retailer instances
   */
  static async createRetailers(retailersData) {
    const retailers = [];
    
    for (const retailerData of retailersData) {
      try {
        const retailer = await this.createRetailer(retailerData);
        retailers.push(retailer);
      } catch (error) {
        logger.error(`Error creating retailer ${retailerData.name}: ${error.message}`);
      }
    }
    
    return retailers;
  }

  /**
   * Registers a new retailer class
   */
  static registerRetailerClass(name, RetailerClass) {
    this.retailerTypes[name.toLowerCase()] = RetailerClass;
    logger.info(`Registered retailer class: ${name}`);
  }
}

// Initialize the retailer types map
RetailerFactory.retailerTypes = {
  bestbuy: BestBuyRetailer,
  amazon: AmazonRetailer
};

module.exports = RetailerFactory;
