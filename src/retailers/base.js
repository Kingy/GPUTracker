const logger = require('../utils/logger');
const productModel = require('../db/models/product');
const priceHistoryModel = require('../db/models/price-history');

class BaseRetailer {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.url = config.url;
    this.active = config.active;
    this.products = [];
  }

  /**
   * Initialize the retailer by loading its products
   */
  async initialize() {
    try {
      this.products = productModel.getProductsByRetailer(this.id);
      logger.info(`${this.name} initialized with ${this.products.length} products`);
    } catch (error) {
      logger.error(`Error initializing ${this.name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Checks all products for this retailer
   * To be implemented by subclasses
   */
  async checkProducts(browser) {
    throw new Error('Method not implemented');
  }

  /**
   * Checks a single product
   * To be implemented by subclasses
   */
  async checkProduct(product, page) {
    throw new Error('Method not implemented');
  }

  /**
   * Records price and stock information for a product
   */
  async recordProductInfo(productId, price, inStock) {
    try {
      await priceHistoryModel.recordPrice(productId, price, inStock);
      logger.debug(`Recorded price for product ${productId}: $${price}, in stock: ${inStock}`);
      return { productId, price, inStock };
    } catch (error) {
      logger.error(`Error recording product info for ${productId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parses a price string into a float
   */
  parsePrice(priceString) {
    if (!priceString) return null;
    
    // Remove currency symbols, commas, and other non-numeric characters
    const numericString = priceString.replace(/[^\d.-]/g, '');
    
    // Parse as float
    const price = parseFloat(numericString);
    return isNaN(price) ? null : price;
  }

  /**
   * Safely extracts text from an element if it exists
   */
  async extractTextFromElement(page, selector) {
    try {
      const element = await page.$(selector);
      if (!element) return null;
      
      const text = await page.evaluate(el => el.textContent, element);
      return text ? text.trim() : null;
    } catch (error) {
      logger.debug(`Error extracting text from ${selector}: ${error.message}`);
      return null;
    }
  }

  /**
   * Checks if an element exists on the page
   */
  async elementExists(page, selector) {
    try {
      const element = await page.$(selector);
      return !!element;
    } catch (error) {
      logger.debug(`Error checking if ${selector} exists: ${error.message}`);
      return false;
    }
  }

  /**
   * Waits for a specific time with jitter to appear more human-like
   * and avoid being detected as a bot
   */
  async randomDelay(min = 1000, max = 3000) {
    const delay = Math.floor(Math.random() * (max - min) + min);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

module.exports = BaseRetailer;
