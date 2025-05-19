const puppeteer = require('puppeteer');
const logger = require('../utils/logger');

class BrowserManager {
  constructor() {
    this.browser = null;
  }

  /**
   * Launches a Puppeteer browser instance with appropriate settings
   */
  async launch() {
    try {
      if (this.browser) {
        logger.info('Browser already running');
        return this.browser;
      }

      logger.info('Launching browser...');
      
      this.browser = await puppeteer.launch({
        headless: true, // Run headless for production
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080'
        ],
        ignoreHTTPSErrors: true,
        defaultViewport: { width: 1920, height: 1080 }
      });

      // Handle browser disconnection
      this.browser.on('disconnected', () => {
        logger.warn('Browser disconnected');
        this.browser = null;
      });

      logger.info('Browser launched successfully');
      return this.browser;
    } catch (error) {
      logger.error(`Error launching browser: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gets the current browser instance or launches a new one
   */
  async getBrowser() {
    try {
      if (!this.browser) {
        return await this.launch();
      }
      return this.browser;
    } catch (error) {
      logger.error(`Error getting browser: ${error.message}`);
      throw error;
    }
  }

  /**
   * Closes the browser instance
   */
  async close() {
    try {
      if (this.browser) {
        logger.info('Closing browser...');
        await this.browser.close();
        this.browser = null;
        logger.info('Browser closed successfully');
      }
    } catch (error) {
      logger.error(`Error closing browser: ${error.message}`);
      this.browser = null;
    }
  }

  /**
   * Creates a new page with default settings
   */
  async newPage() {
    try {
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      
      // Set default viewport
      await page.setViewport({ width: 1366, height: 768 });
      
      // Set a reasonable user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36');
      
      // Block unnecessary resources to speed up page loading
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (resourceType === 'image' || resourceType === 'font' || resourceType === 'media') {
          req.abort();
        } else {
          req.continue();
        }
      });
      
      // Add error handling for page
      page.on('error', error => {
        logger.error(`Page error: ${error.message}`);
      });
      
      return page;
    } catch (error) {
      logger.error(`Error creating new page: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new BrowserManager();
