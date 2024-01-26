exports.successResponse = function (res, msg) {
  var data = {
    status: 200,
    message: msg,
  };
  return res.status(200).json(data);
};

exports.successResponseWithData = function (res, msg, data) {
  var resData = {
    status: 200,
    message: msg,
    data: data,
  };
  return res.status(200).json(resData);
};

exports.successResponseWithTwoData = function (res, msg, data, data2) {
  var resData = {
    status: 200,
    message: msg,
    data: data,
    total: data2,
  };
  return res.status(200).json(resData);
};

exports.ErrorResponse = function (res, msg) {
  var data = {
    status: 500,
    message: msg,
  };
  return res.status(500).json(data);
};

exports.notFoundResponse = function (res, msg) {
  var data = {
    status: 404,
    message: msg,
  };
  return res.status(404).json(data);
};

exports.validationErrorWithData = function (res, msg, data) {
  var resData = {
    status: 400,
    message: msg,
    data: data,
  };
  return res.status(400).json(resData);
};

exports.unauthorizedResponse = function (res, msg) {
  var data = {
    status: 401,
    message: msg,
  };
  return res.status(401).json(data);
};

exports.validation = function (res, msg, error_messages = []) {
  var resData = {
    status: 422,
    message: msg,
    error_messages: Array.isArray(error_messages) ? error_messages : [],
  };
  return res.status(422).json(resData);
};

exports.update = (req, res) => {
  const updateResponse = (result, id, model) => {
    if (result[0] >= 1) {
      res.status(200).json(this.successResponse(res, `${model} with id ${id} successfully updated`));
    } else {
      this.successResponse(res, 'no data updated');
    }
  };

  return { updateResponse: updateResponse };
};

exports.forbiddenResponse = function (res, msg) {
  var data = {
    status: 403,
    message: msg,
  };
  return res.status(401).json(data);
};
