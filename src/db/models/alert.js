const BaseModel = require('./base');
const { db } = require('../migrations/init');
const logger = require('../../utils/logger');

class AlertModel extends BaseModel {
  constructor() {
    super('alerts');
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts() {
    try {
      return db.prepare(`
        SELECT * FROM alerts
        WHERE active = TRUE
      `).all();
    } catch (error) {
      logger.error(`Error getting active alerts: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get alerts for a specific product
   */
  getAlertsForProduct(productId) {
    try {
      return db.prepare(`
        SELECT a.*, nc.type as notification_type, nc.name as notification_name, nc.config as notification_config
        FROM alerts a
        JOIN notification_channels nc ON a.notification_channel_id = nc.id
        WHERE a.product_id = ? AND a.active = TRUE
      `).all(productId);
    } catch (error) {
      logger.error(`Error getting alerts for product ${productId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get alerts for a specific GPU model across all retailers
   */
  getAlertsForGpuModel(gpuModelId) {
    try {
      return db.prepare(`
        SELECT a.*, nc.type as notification_type, nc.name as notification_name, nc.config as notification_config
        FROM alerts a
        JOIN notification_channels nc ON a.notification_channel_id = nc.id
        WHERE a.gpu_model_id = ? AND a.active = TRUE
      `).all(gpuModelId);
    } catch (error) {
      logger.error(`Error getting alerts for GPU model ${gpuModelId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get alerts for a specific retailer
   */
  getAlertsForRetailer(retailerId) {
    try {
      return db.prepare(`
        SELECT a.*, nc.type as notification_type, nc.name as notification_name, nc.config as notification_config
        FROM alerts a
        JOIN notification_channels nc ON a.notification_channel_id = nc.id
        WHERE a.retailer_id = ? AND a.active = TRUE
      `).all(retailerId);
    } catch (error) {
      logger.error(`Error getting alerts for retailer ${retailerId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a new stock alert for a product
   */
  createStockAlert(productId, notificationChannelId) {
    try {
      return this.create({
        product_id: productId,
        alert_type: 'stock',
        notification_channel_id: notificationChannelId,
        active: true
      });
    } catch (error) {
      logger.error(`Error creating stock alert for product ${productId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a new price alert for a product
   */
  createPriceAlert(productId, priceThreshold, notificationChannelId) {
    try {
      return this.create({
        product_id: productId,
        alert_type: 'price',
        price_threshold: priceThreshold,
        notification_channel_id: notificationChannelId,
        active: true
      });
    } catch (error) {
      logger.error(`Error creating price alert for product ${productId}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AlertModel();
