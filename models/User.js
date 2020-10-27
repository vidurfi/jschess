const sequelize = require('sequelize');
const db = require('../config/db');

const User = db.define('user', {
  name: sequelize.STRING,
  email: sequelize.STRING,
  password: sequelize.STRING,
  rating: sequelize.REAL,
  birthDate: sequelize.DATE,
  registrationDate: {
    type: sequelize.DATE,
    default: Date.now()
  },
  information: sequelize.STRING,
});

module.exports = User;
