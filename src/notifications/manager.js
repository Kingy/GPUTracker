const logger = require('../utils/logger');
const SlackNotification = require('./slack');
const EmailNotification = require('./email');
const productModel = require('../db/models/product');
const alertModel = require('../db/models/alert');

class NotificationManager {
  constructor() {
    this.channels = new Map();
    this.notificationTypes = {
      slack: SlackNotification,
      email: EmailNotification
    };
  }

  /**
   * Initialize the notification manager with channels from database
   */
  async initialize() {
    try {
      logger.info('Initializing notification manager...');
      
      // Load active notification channels from database
      const channelRecords = await this.getNotificationChannels();
      
      for (const channelData of channelRecords) {
        try {
          await this.addChannel(channelData);
        } catch (error) {
          logger.error(`Error adding notification channel ${channelData.name}: ${error.message}`);
        }
      }
      
      logger.info(`Notification manager initialized with ${this.channels.size} channels`);
      return true;
    } catch (error) {
      logger.error(`Error initializing notification manager: ${error.message}`);
      return false;
    }
  }

  /**
   * Get notification channels from database
   */
  async getNotificationChannels() {
    // This would typically query the database for notification channels
    // For now, we'll return a mock result
    return [
      {
        id: 1,
        type: 'slack',
        name: 'GPU Alerts',
        config: JSON.stringify({
          webhookUrl: process.env.SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/YOUR_WEBHOOK_URL'
        }),
        active: true
      },
      {
        id: 2,
        type: 'email',
        name: 'Email Alerts',
        config: JSON.stringify({
          host: process.env.EMAIL_HOST || 'smtp.example.com',
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER || 'user@example.com',
            pass: process.env.EMAIL_PASS || 'password'
          },
          from: process.env.EMAIL_FROM || 'gpu-tracker@example.com',
          to: process.env.EMAIL_TO || 'user@example.com'
        }),
        active: true
      }
    ];
  }

  /**
   * Add a notification channel
   */
  async addChannel(channelData) {
    try {
      const { id, type, name } = channelData;
      
      if (!this.notificationTypes[type]) {
        throw new Error(`Unsupported notification type: ${type}`);
      }
      
      const NotificationClass = this.notificationTypes[type];
      const channel = new NotificationClass(channelData);
      
      this.channels.set(id, channel);
      logger.info(`Added notification channel: ${name} (${type})`);
      
      return true;
    } catch (error) {
      logger.error(`Error adding notification channel: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process product check results and send notifications if needed
   */
  async processResults(results) {
    try {
      for (const result of results) {
        // Get the full product details
        const product = productModel.getProductWithDetails(result.id);
        
        if (!product) {
          logger.warn(`Product not found for result: ${result.id}`);
          continue;
        }
        
        // Get alerts for this product
        const alerts = await this.getAlertsForProduct(product.id);
        
        for (const alert of alerts) {
          await this.processAlert(alert, product, result);
        }
      }
    } catch (error) {
      logger.error(`Error processing results: ${error.message}`);
    }
  }

  /**
   * Get alerts for a specific product
   */
  async getAlertsForProduct(productId) {
    // This would typically query the database for alerts
    // For now, we'll return a mock result
    return [
      {
        id: 1,
        product_id: productId,
        alert_type: 'stock',
        notification_channel_id: 1,
        active: true
      },
      {
        id: 2,
        product_id: productId,
        alert_type: 'price',
        price_threshold: 699.99,
        notification_channel_id: 2,
        active: true
      }
    ];
  }

  /**
   * Process an individual alert
   */
  async processAlert(alert, product, result) {
    try {
      const channel = this.channels.get(alert.notification_channel_id);
      
      if (!channel) {
        logger.warn(`Notification channel not found for alert: ${alert.id}`);
        return;
      }
      
      // Determine if notification should be sent based on alert type
      let shouldNotify = false;
      let message = '';
      
      switch (alert.alert_type) {
        case 'stock':
          // Notify when product comes back in stock
          if (result.inStock) {
            shouldNotify = true;
            message = `${product.title} is now in stock at ${product.retailer_name}!`;
          }
          break;
          
        case 'price':
          // Notify when price drops below threshold
          if (result.price && result.price <= alert.price_threshold) {
            shouldNotify = true;
            message = `${product.title} price dropped to $${result.price.toFixed(2)} at ${product.retailer_name}!`;
          }
          break;
          
        default:
          logger.warn(`Unknown alert type: ${alert.alert_type}`);
          return;
      }
      
      if (shouldNotify) {
        // Format product info for notification
        const formattedInfo = channel.formatProductInfo(product, result);
        
        // Send the notification
        await channel.send(message, formattedInfo);
        logger.info(`Sent ${alert.alert_type} notification for ${product.title}`);
      }
    } catch (error) {
      logger.error(`Error processing alert ${alert.id}: ${error.message}`);
    }
  }

  /**
   * Register a new notification type
   */
  registerNotificationType(type, NotificationClass) {
    this.notificationTypes[type] = NotificationClass;
    logger.info(`Registered notification type: ${type}`);
  }

  /**
   * Send a test notification to all channels
   */
  async testAllChannels() {
    const results = [];
    
    for (const [id, channel] of this.channels.entries()) {
      try {
        const success = await channel.test();
        results.push({ id, name: channel.name, type: channel.type, success });
        
        if (success) {
          logger.info(`Test notification sent successfully to ${channel.name}`);
        } else {
          logger.warn(`Test notification failed for ${channel.name}`);
        }
      } catch (error) {
        logger.error(`Error testing channel ${channel.name}: ${error.message}`);
        results.push({ id, name: channel.name, type: channel.type, success: false, error: error.message });
      }
    }
    
    return results;
  }
}

module.exports = NotificationManager;
