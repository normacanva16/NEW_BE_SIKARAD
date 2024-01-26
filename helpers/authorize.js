const response = require('./apiResponse');
const db = require('../models/index');

const Role = db.mst_roles_model;
const User = db.mst_users_model;

module.exports.permit = (permissions) => {
  return async (req, res, next) => {
    const roles = permissions;

    if (!roles) return next();
    const finduser = await User.findOne({ where: { id: req.user.id } });
    const findrole = await Role.findOne({ where: { id: finduser.role_id } });

    if (roles.includes(findrole.name)) return next();

    response.forbiddenResponse(res, 'You have no access to this service');
  };
};
