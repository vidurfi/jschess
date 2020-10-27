const sequelize = require('sequelize');
const db = require('../config/db');


const Party = db.define('party', {
  name: sequelize.STRING,
  date: sequelize.DATE,
  user_id: sequelize.INTEGER,
  activity_id: sequelize.INTEGER,
  isagroup: sequelize.BOOLEAN
});

module.exports = Party;