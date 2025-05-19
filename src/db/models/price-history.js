const BaseModel = require('./base');
const logger = require('../../utils/logger');

class PriceHistoryModel extends BaseModel {
  constructor() {
    super('price_history');
  }

  getLatestPrices(productId, limit = 10) {
    try {
      return db.prepare(`
        SELECT * FROM price_history
        WHERE product_id = ?
        ORDER BY checked_at DESC
        LIMIT ?
      `).all(productId, limit);
    } catch (error) {
      logger.error(`Error getting latest prices for product ${productId}: ${error.message}`);
      throw error;
    }
  }

  getLatestPrice(productId) {
    try {
      return db.prepare(`
        SELECT * FROM price_history
        WHERE product_id = ?
        ORDER BY checked_at DESC
        LIMIT 1
      `).get(productId);
    } catch (error) {
      logger.error(`Error getting latest price for product ${productId}: ${error.message}`);
      throw error;
    }
  }

  recordPrice(productId, price, inStock) {
    try {
      return this.create({
        product_id: productId,
        price,
        in_stock: inStock ? 1 : 0
      });
    } catch (error) {
      logger.error(`Error recording price for product ${productId}: ${error.message}`);
      throw error;
    }
  }

  getPriceChanges(hours = 24) {
    try {
      return db.prepare(`
        WITH latest_prices AS (
          SELECT 
            product_id,
            price,
            in_stock,
            checked_at,
            ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY checked_at DESC) as row_num
          FROM price_history
          WHERE checked_at >= datetime('now', '-' || ? || ' hours')
        ),
        previous_prices AS (
          SELECT 
            product_id,
            price,
            in_stock,
            checked_at,
            ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY checked_at DESC) as row_num
          FROM price_history
          WHERE checked_at < datetime('now', '-' || ? || ' hours')
        )
        SELECT 
          lp.product_id,
          lp.price as current_price,
          lp.in_stock as current_stock,
          pp.price as previous_price,
          pp.in_stock as previous_stock,
          lp.checked_at as current_time,
          pp.checked_at as previous_time
        FROM latest_prices lp
        LEFT JOIN previous_prices pp ON lp.product_id = pp.product_id AND pp.row_num = 1
        WHERE lp.row_num = 1
          AND (lp.price != pp.price OR lp.in_stock != pp.in_stock OR pp.price IS NULL)
      `).all(hours, hours);
    } catch (error) {
      logger.error(`Error getting price changes in the last ${hours} hours: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new PriceHistoryModel();
