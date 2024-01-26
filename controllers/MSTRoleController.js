// Library

// UTILS

const response = require('../helpers/apiResponse');
const Sequelize = require('sequelize');

// MODEL

const db = require('../models/index');
const sequelize = db.sequelize;
const QueryTypes = db.Sequelize.QueryTypes;
const Op = db.Sequelize.Op;

const Role = db.mst_roles_model;

exports.create = async (req, res) => {
  const { name, code } = req.body;
  try {
    await Role.create(
      {
        name,
        code
      },
      {
        individualHooks: true,
      },
    )
      .then(async (result) => {
        const findRole = await Role.findOne({
          where: {
            id: result.id,
          }
        })
        return response.successResponseWithData(res, 'success', findRole);
      })

      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


exports.list = (req, res) => {
  const limit = req.query.size ? parseInt(req.query.size) : 10;
  const offset = req.query.page ? (parseInt(req.query.page) - 1) * limit : 0;
  const search = req.query.search;

  try {
    Role.findAndCountAll({
      limit,
      offset,
      search,
      searchFields: ['name'],
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
