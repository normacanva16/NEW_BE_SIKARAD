function toSequelizeOrder(order) {
  const operator = order[0];

  switch (operator) {
    case '-':
      return [...order.slice(1).split('.'), 'DESC'];
    default:
      return [...order.split('.'), 'ASC'];
  }
}

function toNonModelOrder(sequelize, order) {
  const operator = order[0];

  switch (operator) {
    case '-':
      return [sequelize.literal(`"${order.slice(1)}"`), 'DESC'];
    default:
      return [sequelize.literal(`"${order}"`), 'ASC'];
  }
}

module.exports = (model, options) => {
  const { sequelize } = model;

  if (options.sort && typeof options.sort === 'string') {
    const modelAttributes = Object.keys(model.rawAttributes);
    const orders = options.sort.split(',');

    const customOrder = orders.map((order) => {
      return modelAttributes.includes(order) ? toSequelizeOrder(order) : toNonModelOrder(sequelize, order);
    });
    // eslint-disable-next-line no-param-reassign
    options.order = [...customOrder, ...options.order];

    // eslint-disable-next-line no-param-reassign
    delete options.sort;
  }
};
