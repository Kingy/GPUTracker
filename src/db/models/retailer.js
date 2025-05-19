const BaseModel = require('./base');
const logger = require('../../utils/logger');

class RetailerModel extends BaseModel {
  constructor() {
    super('retailers');
  }

  findByName(name) {
    try {
      return db.prepare('SELECT * FROM retailers WHERE name = ?').get(name);
    } catch (error) {
      logger.error(`Error finding retailer by name ${name}: ${error.message}`);
      throw error;
    }
  }

  getActiveRetailers() {
    try {
      return db.prepare('SELECT * FROM retailers WHERE active = TRUE').all();
    } catch (error) {
      logger.error(`Error getting active retailers: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new RetailerModel();
