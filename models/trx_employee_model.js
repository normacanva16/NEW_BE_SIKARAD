'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid')
module.exports = (sequelize, DataTypes) => {
  class trx_employee_model extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  trx_employee_model.init(
    {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      code_kotama_balakpus: DataTypes.INTEGER,
      kotama_balakpus: DataTypes.STRING,
      kode_jabatan: DataTypes.STRING,
      satuan: DataTypes.STRING,
      nama: DataTypes.STRING,
      pangkat: DataTypes.STRING,
      korps: DataTypes.STRING,
      nrp: DataTypes.STRING,
      jabatan: DataTypes.STRING,
      tmt_jabatan: DataTypes.DATE,
      abit: DataTypes.STRING,
      tingkat_jabatan: DataTypes.STRING,
      dafukaj: DataTypes.STRING,
      masa_jabatan: DataTypes.INTEGER,
      tgl_lahir: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'trx_employee_model',
      tableName: 'trx_employee',
    },
  );

  trx_employee_model.beforeCreate(async (model, options) => {
    model.id = uuidv4()
  });

  return trx_employee_model;
};
