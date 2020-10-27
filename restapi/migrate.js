const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const Activity = require('../models/Activity');
const Party = require('../models/Party');
const User_party = require('../models/User_party');
const User = require('../models/User');
