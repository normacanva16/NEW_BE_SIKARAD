'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid')
module.exports = (sequelize, DataTypes) => {
  class mst_kotama_model extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    
    }
  }
  mst_kotama_model.init(
    {
      id: { allowNull: true, primaryKey: true, type: DataTypes.UUID },
      code: DataTypes.INTEGER,
      nama: DataTypes.STRING,
      alamat: DataTypes.STRING,
      latitude: DataTypes.FLOAT,
      longitude: DataTypes.FLOAT,
      url_gmaps: DataTypes.STRING,
      url_image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'mst_kotama_model',
      tableName: 'mst_kotama',
    },
  );
  mst_kotama_model.beforeCreate(async (model, options) => {
    model.id = uuidv4()
  });
  
  return mst_kotama_model;
};
