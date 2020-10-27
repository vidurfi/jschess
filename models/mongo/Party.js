const mongoose = require('mongoose');
const Activity = require('./Activity');

const PartySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  activity: {
    name: { type: String },
    description: { type: String },
  },
  isagroup: {
    type: Number,
  },
  users: [
    {
      name: { type: String },
      email: { type: String },
      password: { type: String },
      rating: { type: Number },
      birthDate: { type: Date },
      registrationDate: { type: Date },
      information: { type: String },
    },
  ],
});

module.exports = mongoose.model('party', PartySchema);
