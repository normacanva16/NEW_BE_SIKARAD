'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('trx_employee', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      code_kotama_balakpus: {type: Sequelize.INTEGER},
      kotama_balakpus: {type: Sequelize.STRING},
      kode_jabatan: {type: Sequelize.STRING},
      nama: {type: Sequelize.STRING},
      pangkat: {type: Sequelize.STRING},
      korps: {type: Sequelize.STRING},
      nrp: {type: Sequelize.STRING},
      jabatan: {type: Sequelize.STRING},
      tmt_jabatan: {type: Sequelize.DATE},
      abit: {type: Sequelize.STRING},
      tingkat_jabatan: {type: Sequelize.STRING},
      dafukaj: {type: Sequelize.STRING},
      masa_jabatan: {type: Sequelize.INTEGER}
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
    await queryInterface.dropTable('trx_employee');
  }
};