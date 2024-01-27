require('dotenv').config();
const { sequelize } = require('./models/index');

const service = require('./configs/express');
const port = process.env.SERVICE_PORT;
global.__basedir = __dirname + '/..';

async function init() {
  service.start({ port });

  sequelize.authenticate().then(() => {
    console.log('Connect to Database Online');
  });
}

init();
