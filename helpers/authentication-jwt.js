const jwt = require('jsonwebtoken');
const jwtHelper = require('./jwt');
const response = require('./apiResponse');

const authenticateJWTMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, jwtHelper.getJwtSecret(), (err, user) => {
      if (err) {
        //response.forbiddenResponse(err,"Authentication failed verify token")
        return res.status(403).json({
          status: 403,
          message: 'Authentication failed verify token',
        });
      }

      req.user = user;
      next();
    });
  } else {
    //response.ErrorResponse(res,"Authentication failed")
    return res.status(200).json({
      status: 401,
      message: 'Authentication failed',
    });
  }
};

const authJwt = {
  verifyToken: authenticateJWTMiddleware,
};

module.exports = authJwt;
