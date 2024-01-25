'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid')
module.exports = (sequelize, DataTypes) => {
  class mst_roles_model extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.mst_users_model, {
        as: 'mst_users',
        foreignKey: 'role_id',
      });
    }
  }
  mst_roles_model.init(
    {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      name: DataTypes.STRING,
      code: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'mst_roles_model',
      tableName: 'mst_roles',
    },
  );

  mst_roles_model.beforeCreate(async (model, options) => {
    model.id = uuidv4()
  });

  return mst_roles_model;
};
