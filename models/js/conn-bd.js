const Sequelize = require('sequelize');

const sequelize = new Sequelize('mysql', 'root', 'root', {
  dialect: 'mysql',
  host: 'localhost',
  define: {
    timestamps: false,
  },
});

const User = sequelize.define('users', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});

module.exports = sequelize;
module.exports = User;
