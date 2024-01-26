const { validationResult } = require('express-validator');
const response = require('../apiResponse');

module.exports.validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    response.validation(res, 'Validations errors', errors.array());
  };
};
