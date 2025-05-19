const BaseRetailer = require('./base');
const logger = require('../utils/logger');

class BestBuyRetailer extends BaseRetailer {
  constructor(config) {
    super(config);
    this.selectors = {
      price: '.priceView-customer-price span',
      addToCartButton: '.add-to-cart-button',
      soldOutButton: '.btn-disabled',
      productTitle: '.heading-5.v-fw-regular'
    };
  }

  /**
   * Check all products from BestBuy
   */
  async checkProducts(browser) {
    logger.info(`Starting to check ${this.products.length} products from ${this.name}`);
    const results = [];

    for (const product of this.products) {
      try {
        logger.debug(`Checking product: ${product.title}`);
        
        // Open a new page for each product to avoid state issues
        const page = await browser.newPage();
        
        // Set a reasonable viewport and user agent
        await page.setViewport({ width: 1366, height: 768 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36');
        
        // Check the product and record results
        const result = await this.checkProduct(product, page);
        results.push(result);
        
        // Close the page to free up resources
        await page.close();
        
        // Add a small delay between requests to avoid rate limiting
        await this.randomDelay(2000, 5000);
      } catch (error) {
        logger.error(`Error checking product ${product.id} (${product.title}): ${error.message}`);
      }
    }

    logger.info(`Completed checking ${results.length} products from ${this.name}`);
    return results;
  }

  /**
   * Check a specific BestBuy product
   */
  async checkProduct(product, page) {
    try {
      // Navigate to the product page
      await page.goto(product.product_url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Wait for the price element to be available
      await page.waitForSelector(this.selectors.price, { timeout: 10000 }).catch(() => {
        logger.warn(`Price selector not found for ${product.title}`);
      });
      
      // Extract the product information
      const priceText = await this.extractTextFromElement(page, this.selectors.price);
      const price = this.parsePrice(priceText);
      
      // Check if the product is in stock
      const addToCartExists = await this.elementExists(page, this.selectors.addToCartButton);
      const soldOutExists = await this.elementExists(page, this.selectors.soldOutButton);
      const inStock = addToCartExists && !soldOutExists;
      
      // Record the information in the database
      await this.recordProductInfo(product.id, price, inStock);
      
      logger.info(`Product ${product.title}: $${price}, In Stock: ${inStock}`);
      
      return {
        id: product.id,
        title: product.title,
        price,
        inStock,
        url: product.product_url,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`Error checking BestBuy product ${product.id}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = BestBuyRetailer;
