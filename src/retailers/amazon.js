const BaseRetailer = require('./base');
const logger = require('../utils/logger');

class AmazonRetailer extends BaseRetailer {
  constructor(config) {
    super(config);
    this.selectors = {
      price: '#priceblock_ourprice, .a-offscreen',
      availability: '#availability span',
      addToCartButton: '#add-to-cart-button',
      productTitle: '#productTitle'
    };
  }

  /**
   * Check all products from Amazon
   */
  async checkProducts(browser) {
    logger.info(`Starting to check ${this.products.length} products from ${this.name}`);
    const results = [];

    for (const product of this.products) {
      try {
        logger.debug(`Checking product: ${product.title}`);
        
        // Open a new page for each product
        const page = await browser.newPage();
        
        // Set a reasonable viewport and user agent
        await page.setViewport({ width: 1366, height: 768 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36');
        
        // Check the product and record results
        const result = await this.checkProduct(product, page);
        results.push(result);
        
        // Close the page to free up resources
        await page.close();
        
        // Add a longer delay for Amazon to avoid detection
        await this.randomDelay(5000, 10000);
      } catch (error) {
        logger.error(`Error checking product ${product.id} (${product.title}): ${error.message}`);
      }
    }

    logger.info(`Completed checking ${results.length} products from ${this.name}`);
    return results;
  }

  /**
   * Check a specific Amazon product
   */
  async checkProduct(product, page) {
    try {
      // Navigate to the product page
      await page.goto(product.product_url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Extract the product information
      const priceText = await this.extractTextFromElement(page, this.selectors.price);
      const price = this.parsePrice(priceText);
      
      // Check if the product is in stock
      const availabilityText = await this.extractTextFromElement(page, this.selectors.availability);
      const addToCartExists = await this.elementExists(page, this.selectors.addToCartButton);
      
      // Amazon has various ways to indicate if something is in stock
      let inStock = false;
      if (availabilityText) {
        inStock = !availabilityText.toLowerCase().includes('unavailable') && 
                  !availabilityText.toLowerCase().includes('out of stock') &&
                  addToCartExists;
      } else {
        inStock = addToCartExists;
      }
      
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
      logger.error(`Error checking Amazon product ${product.id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Amazon requires special handling as they may detect scraping
   * This method adds additional anti-detection measures
   */
  async extractTextFromElement(page, selector) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 }).catch(() => {
        logger.warn(`Selector ${selector} not found`);
      });
      
      // Add random mouse movements to appear more human-like
      const element = await page.$(selector);
      if (element) {
        const box = await element.boundingBox();
        if (box) {
          // Move to a random position near the element
          await page.mouse.move(
            box.x + Math.random() * box.width,
            box.y + Math.random() * box.height,
            { steps: 10 }
          );
        }
      }

      return super.extractTextFromElement(page, selector);
    } catch (error) {
      logger.debug(`Error extracting text from ${selector}: ${error.message}`);
      return null;
    }
  }
}

module.exports = AmazonRetailer;
