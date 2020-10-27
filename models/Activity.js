const sequelize = require('sequelize');
const db = require('../config/db');


const Activity = db.define('activity', {
  name: sequelize.STRING,
  description: sequelize.STRING,
});

module.exports = Activity;