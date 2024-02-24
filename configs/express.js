const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const methodOverride = require('method-override');
const helmet = require('helmet');

const mstroleRoute = require('../routes/mst_role_route');
const mstkotamaRoute = require('../routes/mst_kotama_route');
const userRoute = require('../routes/user_route');
const TRXEmployeeRoute = require('../routes/trx_employee_route');
const dashboardRoute = require('../routes/new_dashboard_route');
const UserLogRoute = require('../routes/trx_activity_user_route');
exports.start = (config) => {

  const app = express();

  app.use(helmet());

  app.use(cors());

  // lets you use HTTP verbs such as PUT or DELETE
  // in places where the client doesn't support it
  app.use(methodOverride());

  // parse body params and attache them to req.body
  app.use(bodyParser.json({ limit: '100mb' }));

  // support parsing of application/x-www-form-urlencoded post data
  // app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.urlencoded({limit: '100mb', parameterLimit: 100000, extended: true}));

  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Middleware untuk mengatur batas waktu untuk Timing-Allow-Origin
app.use(function(req, res, next) {
    res.setHeader('Timing-Allow-Origin', '*');
    next();
});

  app.get(`/`, function (req, res) {
    res.status(200).json({
      status_code: 200,
      success: false,
      message: 'berhasil masuk',
    });
  });

  app.use('/mst-roles', mstroleRoute)
  app.use('/mst-kotama', mstkotamaRoute);
  app.use('/users', userRoute);
  app.use('/dashboard', dashboardRoute);
  app.use('/employee', TRXEmployeeRoute);
  app.use('/dashboard', dashboardRoute);
  app.use('/user-log', UserLogRoute);


  try {
    app.listen(config.port, () => {
      console.log(`Server start on port ${config.port}`);
    });
  } catch (error) {
    console.log('Error start server:', error);
  }
};
