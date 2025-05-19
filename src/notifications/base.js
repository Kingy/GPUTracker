const logger = require('../utils/logger');

class BaseNotification {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.config = typeof config.config === 'string' ? JSON.parse(config.config) : config.config;
    this.active = config.active;
  }

  /**
   * Sends a notification through this channel
   * To be implemented by subclasses
   */
  async send(message, data) {
    throw new Error('Method not implemented');
  }

  /**
   * Formats the product information for a notification
   */
  formatProductInfo(product, priceInfo) {
    const currentPrice = priceInfo.price ? `$${priceInfo.price.toFixed(2)}` : 'N/A';
    const stockStatus = priceInfo.in_stock ? 'In Stock' : 'Out of Stock';
    
    return {
      title: product.title,
      url: product.product_url,
      retailer: product.retailer_name,
      price: currentPrice,
      stockStatus,
      timestamp: new Date().toISOString(),
      message: `${product.title} is now ${stockStatus} at ${product.retailer_name} for ${currentPrice}`,
      ...priceInfo
    };
  }

  /**
   * Validates the configuration
   * To be implemented by subclasses
   */
  validateConfig() {
    throw new Error('Method not implemented');
  }

  /**
   * Tests the notification channel with a test message
   */
  async test() {
    try {
      await this.send('Test Notification', {
        title: 'Test GPU',
        price: 599.99,
        stockStatus: 'In Stock (Test)',
        retailer: 'Test Retailer',
        url: 'https://example.com/test-gpu',
        timestamp: new Date().toISOString()
      });
      
      logger.info(`Test notification sent successfully via ${this.type} channel: ${this.name}`);
      return true;
    } catch (error) {
      logger.error(`Test notification failed for ${this.type} channel: ${this.name} - ${error.message}`);
      return false;
    }
  }
}

module.exports = BaseNotification;
