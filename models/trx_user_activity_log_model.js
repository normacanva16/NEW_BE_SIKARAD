'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid')
module.exports = (sequelize, DataTypes) => {
  class trx_user_activity_log_model extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    
    }
  }
  trx_user_activity_log_model.init(
    {
      id: { allowNull: true, primaryKey: true, type: DataTypes.INTEGER },
      email: DataTypes.STRING,
      activity_date: DataTypes.DATE,
      activity: DataTypes.STRING,
      ip_address: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'trx_user_activity_log_model',
      tableName: 'trx_user_activity_log',
    },
  );

  trx_user_activity_log_model.beforeCreate(async (model, options) => {
    model.id = uuidv4()
  });
  
  return trx_user_activity_log_model;
};
