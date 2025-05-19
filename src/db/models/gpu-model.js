const BaseModel = require('./base');
const { db } = require('../migrations/init');
const logger = require('../../utils/logger');

class GpuModel extends BaseModel {
  constructor() {
    super('gpu_models');
  }

  /**
   * Find a GPU model by its name and brand
   */
  findByNameAndBrand(name, brandId) {
    try {
      return db.prepare(`
        SELECT * FROM gpu_models
        WHERE name = ? AND brand_id = ?
      `).get(name, brandId);
    } catch (error) {
      logger.error(`Error finding GPU model by name ${name} and brand ${brandId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all GPU models with their brand information
   */
  getAllWithBrands() {
    try {
      return db.prepare(`
        SELECT gm.*, b.name as brand_name
        FROM gpu_models gm
        JOIN brands b ON gm.brand_id = b.id
      `).all();
    } catch (error) {
      logger.error(`Error getting all GPU models with brands: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all GPU models by chip manufacturer (e.g., NVIDIA, AMD)
   */
  getByChipManufacturer(chipManufacturer) {
    try {
      return db.prepare(`
        SELECT gm.*, b.name as brand_name
        FROM gpu_models gm
        JOIN brands b ON gm.brand_id = b.id
        WHERE gm.chip_manufacturer = ?
      `).all(chipManufacturer);
    } catch (error) {
      logger.error(`Error getting GPU models by chip manufacturer ${chipManufacturer}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all GPU models by specific chip model (e.g., RTX 5070, RX 9800)
   */
  getByChipModel(chipModel) {
    try {
      return db.prepare(`
        SELECT gm.*, b.name as brand_name
        FROM gpu_models gm
        JOIN brands b ON gm.brand_id = b.id
        WHERE gm.chip_model = ?
      `).all(chipModel);
    } catch (error) {
      logger.error(`Error getting GPU models by chip model ${chipModel}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all GPU models by brand
   */
  getByBrand(brandId) {
    try {
      return db.prepare(`
        SELECT gm.*, b.name as brand_name
        FROM gpu_models gm
        JOIN brands b ON gm.brand_id = b.id
        WHERE gm.brand_id = ?
      `).all(brandId);
    } catch (error) {
      logger.error(`Error getting GPU models by brand ${brandId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a new GPU model
   */
  createGpuModel(data) {
    try {
      const { 
        brand_id, 
        name, 
        model_number,
        chip_manufacturer,
        chip_model,
        memory_size,
        memory_type
      } = data;

      return this.create({
        brand_id,
        name,
        model_number,
        chip_manufacturer,
        chip_model,
        memory_size,
        memory_type
      });
    } catch (error) {
      logger.error(`Error creating GPU model: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new GpuModel();
