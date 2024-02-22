// Library

// UTILS

const response = require('../helpers/apiResponse');
const Sequelize = require('sequelize');

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
