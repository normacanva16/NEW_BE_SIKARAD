'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mst_roles', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: {
        type: Sequelize.STRING
      },
      code: {
        type: Sequelize.STRING
      }
      ,
      created_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      created_by:{
        type: Sequelize.UUID
      },
      updated_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_by: {
        type: Sequelize.UUID
      },
      deleted_date:{
        type: Sequelize.DATE
      },
      deleted_by:{
        type: Sequelize.UUID
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mst_roles');
  }
};