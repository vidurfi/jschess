const sequelize = require('sequelize');
const db = require('../config/db');

const Party = require('../models/Party');
const User = require('../models/Party');

const User_party = db.define('user_party', {
  user_id: {
    type: sequelize.INTEGER,
    reference: {
        model:'users',
        key:'id'
    },
    field: 'user_id'
  },
  party_id: {
      type: sequelize.INTEGER,
    reference : {
        model:'activities',
        key:'id'
    },
    field: 'party_id'
      }, 
    numberofusers: sequelize.INTEGER,
  isgoing: sequelize.BOOLEAN
});

// User.hasMany(User_party);
// Party.hasMany(User_party);

module.exports = User_party;