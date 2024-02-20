const { Op, STRING } = require('sequelize');

module.exports = (model, options) => {
  const { sequelize } = model;

  if (options.search) {
    let keys;

    if (options.searchFields) {
      if (Array.isArray(options.searchFields) && options.searchFields.length) keys = options.searchFields;
      else keys = options.searchFields.split(',');
    } else {
      keys = Object.keys(model.rawAttributes);
    }

    const searchQueries = keys
      // .filter((key) => model.rawAttributes[key] !== undefined)
      .map((key) => {
        const attr = model.rawAttributes[key];

        if (attr) {
          if (attr.type.key !== STRING.key) {
            return sequelize.where(sequelize.cast(sequelize.col(`${model.options.name.singular}.${attr.field}`), 'varchar'), {
              [Op.iLike]: `%${options.search}%`,
            });
          }
        }

        return { [key]: { [Op.iLike]: `%${options.search}%` } };
      });

    // eslint-disable-next-line no-param-reassign
    options.where = { ...options.where, [Op.or]: searchQueries };

    // eslint-disable-next-line no-param-reassign
    delete options.search;
    // eslint-disable-next-line no-param-reassign
    delete options.searchFields;
  }
};
