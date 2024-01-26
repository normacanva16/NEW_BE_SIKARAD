'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mst_users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      fullname: {type: Sequelize.STRING},
      phone_number: {type: Sequelize.STRING},
      email: {type: Sequelize.STRING},
      username: {type: Sequelize.STRING},
      password: {type: Sequelize.STRING},
      is_active: {type: Sequelize.INTEGER},
      role_id: {type: Sequelize.UUID,
        allowNull: false,
      references: {
        model: {
          tableName: 'mst_roles',
        },
        key: "id",
      }},
      token: {type: Sequelize.STRING}
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
    await queryInterface.dropTable('mst_users');
  }
};