const { db } = require('../migrations/init');
const logger = require('../../utils/logger');

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  getAll() {
    try {
      return db.prepare(`SELECT * FROM ${this.tableName}`).all();
    } catch (error) {
      logger.error(`Error getting all from ${this.tableName}: ${error.message}`);
      throw error;
    }
  }

  getById(id) {
    try {
      return db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`).get(id);
    } catch (error) {
      logger.error(`Error getting id ${id} from ${this.tableName}: ${error.message}`);
      throw error;
    }
  }

  create(data) {
    try {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const info = db.prepare(`
        INSERT INTO ${this.tableName} (${columns})
        VALUES (${placeholders})
      `).run(...values);

      return { id: info.lastInsertRowid, ...data };
    } catch (error) {
      logger.error(`Error creating record in ${this.tableName}: ${error.message}`);
      throw error;
    }
  }

  update(id, data) {
    try {
      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), id];

      const info = db.prepare(`
        UPDATE ${this.tableName}
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(...values);

      return info.changes > 0;
    } catch (error) {
      logger.error(`Error updating id ${id} in ${this.tableName}: ${error.message}`);
      throw error;
    }
  }

  delete(id) {
    try {
      const info = db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`).run(id);
      return info.changes > 0;
    } catch (error) {
      logger.error(`Error deleting id ${id} from ${this.tableName}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = BaseModel;
