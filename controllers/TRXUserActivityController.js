// Library

// UTILS

const response = require('../helpers/apiResponse');
const Sequelize = require('sequelize');
const xl = require('excel4node');

// MODEL

const db = require('../models/index');
const sequelize = db.sequelize;
const QueryTypes = db.Sequelize.QueryTypes;
const Op = db.Sequelize.Op;

const UserActivityLog = db.trx_user_activity_log_model;

exports.listUserActivityLog = (req, res) => {
  const limit = req.query.size ? parseInt(req.query.size) : 10;
  const offset = req.query.page ? (parseInt(req.query.page) - 1) * limit : 0;
  const start_date = req.query.start_date;
  const end_date = req.query.end_date;
  const search = req.query.search;

  try {

    let whereCondition = {}; // Definisikan objek untuk menyimpan kondisi filter

    if (start_date && end_date) {
      // Jika start_date dan end_date ada, tambahkan filter untuk activity_date antara start_date dan end_date
      whereCondition.activity_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    UserActivityLog.findAndCountAll({
      limit,
      offset,
      search,
      searchFields: ['activity', 'email', 'ip_address'],
      attributes: ['id', 'activity', 'ip_address', 'email', 
      [Sequelize.literal("COALESCE(TO_CHAR(activity_date, 'DD Mon YYYY HH24:MI:SS'), '')"), 'activity_date'],
    ],
      where: whereCondition,
      order: [['created_date', 'DESC']],
    })
      .then((data) => {
        const payload = {
          content: data.rows,
          totalData: data.count,
        };
        return response.successResponseWithData(res, 'success', payload);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


exports.exportListUserActivityLog = (req, res) => {

  const start_date = req.query.start_date;
  const end_date = req.query.end_date;

  let whereCondition = {}; // Definisikan objek untuk menyimpan kondisi filter

    if (start_date && end_date) {
      // Jika start_date dan end_date ada, tambahkan filter untuk activity_date antara start_date dan end_date
      whereCondition.activity_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    UserActivityLog.findAndCountAll({
      attributes: ['id', 'activity', 'ip_address', 'email', 
      [Sequelize.literal("COALESCE(TO_CHAR(activity_date, 'DD Mon YYYY HH24:MI:SS'), '')"), 'activity_date'],
    ],
      where: whereCondition,
      order: [['created_date', 'DESC']],
    })
    .then(async (data) => {
      let transaksiArray = [];

      data.rows.forEach((row) => {
        transaksiArray.push({
          activity_date: row.dataValues.activity_date,
          ip_address: row.dataValues.ip_address,
          email: row.dataValues.email,
          activity : row.dataValues.activity
        });
      });

      const wb = new xl.Workbook();
      const ws = wb.addWorksheet('Data Activity Log');
      const headingColumnNames = [
        'ACTIVITY DATE',
        'IP ADDRESS',
        'EMAIL',
        'ACTIVITY',
      ];
      let headingColumnIndex = 1;
      headingColumnNames.forEach((heading) => {
        ws.cell(1, headingColumnIndex++).string(heading);
      });
      let rowIndex = 2;
      transaksiArray.forEach((record) => {
        let columnIndex = 1;
        Object.keys(record).forEach((columnName) => {
          ws.cell(rowIndex, columnIndex++).string(record[columnName]);
        });
        rowIndex++;
      });

      const currentDate = new Date();

      var filename = `DataActivityLog_${('0' + currentDate.getDate()).slice(-2)}${('0' + (currentDate.getMonth() + 1)).slice(
        -2,
      )}${currentDate.getFullYear().toString().substr(-2)}`;
      returnData = {
        metadata: {
          link: filename,
        },
      };
      wb.write(`${filename}.xlsx`, res);

    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};