const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');
const UserMongo = require('../models/mongo/User');
const Party = require('../models/Party');
const PartyMongo = require('../models/mongo/Party');
const User_party = require('../models/User_party');
const Activity = require('../models/Activity');

// @route   POST restapi/users
// @desc    Register user
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
      //See if user exists already
      let user = await User.findOne({ where: { email } });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists.' }] });
      }

      user = new User({
        name,
        email,
        password,
      });
      // Encrypt password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      user.save();
      //Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      ); //it need to be changed back to 3600 in production
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error.');
    }
  }
);

router.post('/migrate', async (req, res) => {
  try {
    console.log('migrating users');
    const userAll = await User.findAll();
    const partyAll = await Party.findAll();
    const userpartyAll = await User_party.findAll();
    const activityAll = await Activity.findAll();
    try {
      await userAll.forEach((user) => {
        var parties = [];
        userpartyAll.forEach((userpartyElement) => {
          if (userpartyElement.user_id == user.id) {
            let actualParty;
            partyAll.forEach((partyElement) => {
              if (partyElement.id == userpartyElement.party_id) {
                let actualActivity;
                activityAll.forEach((activityElement) => {
                  if (activityElement.id == partyElement.activity_id) {
                    actualActivity = activityElement;
                  }
                });
                actualParty = {
                  name: partyElement.name,
                  date: partyElement.date,
                  activity: {
                    name: actualActivity.name,
                    description: actualActivity.description,
                  },
                  isagroup: partyElement.isagroup,
                };
              }
            });
            parties.push(actualParty);
          }
        });
        userMongo = new UserMongo({
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          rating: user.rating,
          birthDate: user.birthDate,
          registrationDate: user.registrationDate,
          information: user.information,
          parties: parties,
        });
        userMongo.save();
      });
      res.status(200).send('ok');
    } catch (err) {
      console.log(err);
      res.status(500).send('error');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
