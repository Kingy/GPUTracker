const BaseModel = require('./base');
const { db } = require('../migrations/init');
const logger = require('../../utils/logger');

class ProductModel extends BaseModel {
  constructor() {
    super('products');
  }

  getProductWithDetails(id) {
    try {
      return db.prepare(`
        SELECT 
          p.*,
          r.name as retailer_name,
          r.url as retailer_url,
          gm.name as gpu_name,
          gm.model_number,
          gm.chip_manufacturer,
          gm.chip_model,
          gm.memory_size,
          gm.memory_type,
          b.name as brand_name
        FROM products p
        JOIN retailers r ON p.retailer_id = r.id
        JOIN gpu_models gm ON p.gpu_model_id = gm.id
        JOIN brands b ON gm.brand_id = b.id
        WHERE p.id = ?
      `).get(id);
    } catch (error) {
      logger.error(`Error getting product with details for id ${id}: ${error.message}`);
      throw error;
    }
  }

  getProductsByRetailer(retailerId) {
    try {
      return db.prepare(`
        SELECT * FROM products
        WHERE retailer_id = ? AND active = TRUE
      `).all(retailerId);
    } catch (error) {
      logger.error(`Error getting products for retailer ${retailerId}: ${error.message}`);
      throw error;
    }
  }

  getProductsByGpuModel(gpuModelId) {
    try {
      return db.prepare(`
        SELECT * FROM products
        WHERE gpu_model_id = ? AND active = TRUE
      `).all(gpuModelId);
    } catch (error) {
      logger.error(`Error getting products for GPU model ${gpuModelId}: ${error.message}`);
      throw error;
    }
  }

  getActiveProducts() {
    try {
      return db.prepare(`
        SELECT * FROM products
        WHERE active = TRUE
      `).all();
    } catch (error) {
      logger.error(`Error getting active products: ${error.message}`);
      throw error;
    }
  }

  getByRetailerAndProductId(retailerId, productId) {
    try {
      return db.prepare(`
        SELECT * FROM products
        WHERE retailer_id = ? AND product_id = ?
      `).get(retailerId, productId);
    } catch (error) {
      logger.error(`Error getting product by retailer ${retailerId} and product ID ${productId}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ProductModel();
