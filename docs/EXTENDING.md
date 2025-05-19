# Extending the Application

## Adding a New Retailer

The GPU Tracker is designed to be easily extensible. To add a new retailer, follow these steps:

1. **Create a configuration file**: Add a new configuration file in `config/retailers/` directory, e.g., `newegg.config.js`:

```javascript
module.exports = {
  name: 'Newegg',
  url: 'https://www.newegg.com',
  active: true,
  selectors: {
    price: '.price-current',
    availability: '.product-inventory',
    addToCartButton: '.btn-primary',
    productTitle: '.product-title'
  },
  products: [
    // Your product definitions for Newegg
  ],
  retryLimit: 3,
  retryDelay: 5000,
  requestDelay: 3000
};
```

2. **Create a retailer class**: Create a new class that extends `BaseRetailer` in `src/retailers/newegg.js`:

```javascript
const BaseRetailer = require('./base');
const logger = require('../utils/logger');

class NeweggRetailer extends BaseRetailer {
  constructor(config) {
    super(config);
    this.selectors = config.selectors || {
      price: '.price-current',
      availability: '.product-inventory',
      addToCartButton: '.btn-primary',
      productTitle: '.product-title'
    };
  }

  async checkProduct(product, page) {
    try {
      // Navigate to the product page
      await page.goto(product.product_url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Extract the product information
      const priceText = await this.extractTextFromElement(page, this.selectors.price);
      const price = this.parsePrice(priceText);
      
      // Check if the product is in stock (Newegg specific logic)
      const availabilityText = await this.extractTextFromElement(page, this.selectors.availability);
      const addToCartExists = await this.elementExists(page, this.selectors.addToCartButton);
      
      const inStock = addToCartExists && 
                     (!availabilityText || !availabilityText.toLowerCase().includes('out of stock'));
      
      // Record the information in the database
      await this.recordProductInfo(product.id, price, inStock);
      
      return {
        id: product.id,
        title: product.title,
        price,
        inStock,
        url: product.product_url,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`Error checking Newegg product ${product.id}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = NeweggRetailer;
```

3. **Register the retailer**: Update the `RetailerFactory` in `src/retailers/factory.js` to include your new retailer:

```javascript
// Add this to imports
const NeweggRetailer = require('./newegg');

// Add this to retailerTypes
RetailerFactory.retailerTypes = {
  bestbuy: BestBuyRetailer,
  amazon: AmazonRetailer,
  newegg: NeweggRetailer
};
```

## Adding a New Notification Channel

To add a new notification channel (like Discord):

1. **Create a configuration file**: Add a new configuration file in `config/notifications/` directory, e.g., `discord.config.js`:

```javascript
module.exports = {
  name: 'Discord GPU Alerts',
  type: 'discord',
  active: true,
  config: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/your-webhook-url',
    username: 'GPU Tracker Bot',
    avatar_url: 'https://example.com/bot-avatar.png'
  }
};
```

2. **Create a notification class**: Create a new class that extends `BaseNotification` in `src/notifications/discord.js`:

```javascript
const BaseNotification = require('./base');
const axios = require('axios');
const logger = require('../utils/logger');

class DiscordNotification extends BaseNotification {
  constructor(config) {
    super(config);
    this.validateConfig();
  }

  validateConfig() {
    if (!this.config.webhookUrl) {
      throw new Error('Discord webhook URL is required');
    }
  }

  async send(message, data) {
    try {
      const { title, price, stockStatus, retailer, url, timestamp } = data;
      
      // Create a Discord webhook message
      const discordMessage = {
        content: message,
        username: this.config.username || 'GPU Tracker',
        avatar_url: this.config.avatar_url,
        embeds: [
          {
            title: `${title}`,
            description: `**Stock Status:** ${stockStatus}\n**Price:** ${price}`,
            url: url,
            color: stockStatus.includes('In Stock') ? 5025616 : 16711680, // Green for in stock, red for out of stock
            fields: [
              {
                name: 'Retailer',
                value: retailer,
                inline: true
              }
            ],
            footer: {
              text: `Notification sent at: ${new Date(timestamp).toLocaleString()}`
            }
          }
        ]
      };

      // Send the message to Discord
      const response = await axios.post(this.config.webhookUrl, discordMessage);
      
      if (response.status === 204) {
        logger.info(`Discord notification sent successfully to ${this.name}`);
        return true;
      } else {
        throw new Error(`Discord API returned: ${response.status}`);
      }
    } catch (error) {
      logger.error(`Error sending Discord notification: ${error.message}`);
      throw error;
    }
  }
}

module.exports = DiscordNotification;
```

3. **Register the notification channel**: Update the `NotificationManager` in `src/notifications/manager.js` to include your new channel:

```javascript
// Add this to imports
const DiscordNotification = require('./discord');

// Update the notification types
this.notificationTypes = {
  slack: SlackNotification,
  email: EmailNotification,
  discord: DiscordNotification
};
```

## Customizing Alert Conditions

You can also customize the alert conditions by modifying the `processAlert` method in `src/notifications/manager.js`. For example, to add a new alert type for price drops:

```javascript
async processAlert(alert, product, result) {
  // ...existing code...
  
  switch (alert.alert_type) {
    case 'stock':
      // ...
    case 'price':
      // ...
    case 'price_drop':
      // Get previous price from history
      const previousPrice = await priceHistoryModel.getPreviousPrice(product.id);
      
      // Notify when price drops by a certain percentage
      if (previousPrice && result.price && previousPrice > result.price) {
        const priceDrop = ((previousPrice - result.price) / previousPrice) * 100;
        
        if (priceDrop >= alert.percentage_threshold) {
          shouldNotify = true;
          message = `${product.title} price dropped by ${priceDrop.toFixed(1)}% from $${previousPrice.toFixed(2)} to $${result.price.toFixed(2)} at ${product.retailer_name}!`;
        }
      }
      break;
    
    // ...
  }
  
  // ...existing code...
}
```

This extensible architecture allows you to easily add support for more retailers, notification channels, and alert types as your needs evolve.
