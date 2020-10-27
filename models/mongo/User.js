const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
  },
  birthDate: {
    type: Date,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  information: {
    type: String,
  },
  parties: [
    {
      name: { type: String },
      date: { type: Date },
      activity: {
        name: { type: String },
        description: { type: String },
      },
      isagroup: { type: Number },
    },
  ],
});

module.exports = mongoose.model('user', UserSchema);
