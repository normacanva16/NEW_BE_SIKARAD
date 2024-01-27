'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '../configs/database.js'));
const pg = require('pg');
const db = {};

const applySearchQuery = require('../helpers/utilities/applySearchQuery');
const applySortQuery = require('../helpers/utilities/applySortQuery');

let sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  timezone: config.timezone,
  dialectModule: pg,
  define: {
    schema: config.schema,
    migrationStorageTableSchema: config.migrationStorageTableSchema,
    timestamps: true,
    paranoid: true,
    createdAt: 'created_date',
    updatedAt: 'updated_date',
    deletedAt: 'deleted_date',
    classMethods: {},
    defaultScope: {},
    hooks: {
      beforeFind(options) {
        // =================================
        // Required for Paginated Request
        // =================================
        applySortQuery(this, options);
        applySearchQuery(this, options);
        // =================================
        // End for Paginated Request
        // =================================
        return options;
      },
      beforeCount(options) {
        // =================================
        // Required for Paginated Request
        // =================================
        applySearchQuery(this, options);
        // =================================
        // End for Paginated Request
        // =================================
        return options;
      },
      // =================================
      // Required for Audit on Create
      // =================================
      beforeCreate(instance, options) {
        if (options.user && instance && instance.created_by === undefined) {
          instance.created_by = options.user.id;
          instance.updated_by = options.user.id;
        }
      },
      // =================================
      // Required for Audit on Update
      // =================================
      beforeUpdate(instance, options) {
        if (options.user) {
          instance.updated_by = options.user.id;
        }
      },
      // =================================
      // Required for Audit on Delete
      // =================================
      beforeDestroy(instance, options) {
        instance.deleted_by = options.user.id;
      },
    },
  },
});

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
