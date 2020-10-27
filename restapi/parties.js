const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const Activity = require('../models/Activity');
const ActivityMongo = require('../models/mongo/Activity');
const Party = require('../models/Party');
const User_party = require('../models/User_party');
const User = require('../models/User');
const PartyMongo = require('../models/mongo/Party');
const UserMongo = require('../models/mongo/User');

// @route   POST restapi/parties
// @desc    Create a post
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Party name is required').not().isEmpty(),
      check('activity_name', 'Activity can not be empty').not().isEmpty(),
      check('date', 'Date can not be empty').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //Creating the party itself
      const activity = await Activity.findOne({
        where: { name: req.body.activity_name },
      });
      if (activity == null) {
        return res.status(404).json({
          errors: [{ msg: 'You need to choose an existing activity' }],
        });
      }
      const newParty = new Party({
        name: req.body.name,
        date: req.body.date,
        user_id: req.user.id,
        activity_id: activity.id,
        isagroup: false,
      });
      //Creat the join table data, automatically adding 1 to the number of users
      const party = await newParty.save();
      const newUserParty = new User_party({
        user_id: req.user.id,
        party_id: party.id,
        numberofusers: 1,
        isgoing: 0,
      });
      const userForMongo = await User.findOne({
        where: { id: req.user.id },
      });
      const newPartyMongo = new PartyMongo({
        name: req.body.name,
        date: req.body.date,
        activity: {
          name: activity.name,
          description: activity.description,
        },
        isagroup: false,
        users: [
          {
            name: userForMongo.name,
            email: userForMongo.email,
            password: userForMongo.password,
            rating: userForMongo.rating,
            birthDate: userForMongo.birthDate,
            rehistrationDate: userForMongo.registrationDate,
            information: userForMongo.information,
          },
        ],
      });
      await UserMongo.findOneAndUpdate(
        { email: userForMongo.email },
        {
          $push: {
            parties: {
              name: newPartyMongo.name,
              date: newPartyMongo.date,
              activity: {
                name: activity.name,
                description: activity.description,
              },
              isagroup: 0,
            },
          },
        }
      ),
        await newPartyMongo.save();
      await newUserParty.save();
      res.json(party);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST restapi/parties/report
// @desc    Create a report, which tells about every user how many times participated in a party with a given activity
// @access  Private
router.post(
  '/report',
  [auth, [check('activity_name', 'Activity is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const activity = await Activity.findOne({
        where: { name: req.body.activity_name },
      });
      const parties = await Party.findAll({
        where: { activity_id: activity.id },
      });
      var selectedPartiesArray = [];
      parties.forEach((partyElement) => {
        selectedPartiesArray.push(partyElement.dataValues.id);
      });
      //console.log(selectedPartiesArray);
      const user_parties = await User_party.findAll({
        attributes: ['user_id'],
        where: { party_id: selectedPartiesArray },
      });
      var selectedUserPartiesArray = [];
      user_parties.forEach((userPartyElement) => {
        selectedUserPartiesArray.push(userPartyElement.dataValues.user_id);
      });
      //console.log(selectedUserPartiesArray);
      const users = await User.findAll();
      var reportStringArray = [];
      users.forEach((userElement) => {
        var counter = 0;
        selectedUserPartiesArray.forEach((selectedUserPartyElement) => {
          if (userElement.dataValues.id == selectedUserPartyElement) {
            counter++;
          }
        });
        var reportString =
          'name: ' +
          userElement.dataValues.name +
          ' with email: ' +
          userElement.dataValues.email +
          ' participated in parties with this activity: ' +
          req.body.activity_name +
          '  ' +
          counter +
          ' times.';
        reportStringArray.push(reportString);
      });
      console.log(reportStringArray);
      res.json(reportStringArray);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);
// This is the modified report REST for the mongodb
router.post(
  '/reportmongo',
  [auth, [check('activity_name', 'Activity is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const users = await UserMongo.find({});
      var reportStringArray = [];
      users.forEach((userElement) => {
        var counter = 0;
        userElement.parties.forEach((partyElement) => {
          if (req.body.activity_name == partyElement.activity.name) {
            counter++;
          }
        });
        var reportString =
          'name: ' +
          userElement.name +
          ' with email: ' +
          userElement.email +
          ' participated in parties with this activity: ' +
          req.body.activity_name +
          '  ' +
          counter +
          ' times.';
        reportStringArray.push(reportString);
      });
      console.log(reportStringArray);
      res.json(reportStringArray);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//MODIFIED TO BE ABLE TO INITIALIZE FROM FRONTEND
// @route   POST restapi/parties/initialize
// @desc    Create a post
// @access  Private
router.post('/initialize', async (req, res) => {
  try {
    //Creating the party itself
    const activity = await Activity.findOne({
      where: { name: req.body.activity_name },
    });
    if (activity == null) {
      return res.status(404).json({
        errors: [{ msg: 'You need to choose an existing activity' }],
      });
    }
    const newParty = new Party({
      name: req.body.name,
      date: req.body.date,
      user_id: req.body.user_id,
      activity_id: activity.id,
      isagroup: false,
    });
    //Creat the join table data, automatically adding 1 to the number of users
    const party = await newParty.save();
    const newUserParty = new User_party({
      user_id: req.body.user_id,
      party_id: party.id,
      numberofusers: 1,
      isgoing: 0,
    });
    await newUserParty.save();
    res.status(200).send('ok');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/migrate', async (req, res) => {
  try {
    console.log('migrating parties');
    const partyAll = await Party.findAll();
    const activityAll = await Activity.findAll();
    const userAll = await User.findAll();
    const userpartyAll = await User_party.findAll();
    try {
      await partyAll.forEach((party) => {
        let activity;
        var users = [];
        activityAll.forEach((activityElement) => {
          if (activityElement.id == party.activity_id) {
            activity = activityElement;
          }
        });
        userpartyAll.forEach((userpartyElement) => {
          if (userpartyElement.party_id == party.id) {
            let actualUser;
            userAll.forEach((userElement) => {
              if (userElement.id == userpartyElement.user_id) {
                actualUser = {
                  name: userElement.name,
                  email: userElement.email,
                  password: userElement.password,
                  rating: userElement.rating,
                  birthDate: userElement.birthDate,
                  registrationDate: userElement.registrationDate,
                  information: userElement.information,
                };
              }
            });
            users.push(actualUser);
            actualUser = null;
          }
        });
        //console.log(users);
        partyMongo = new PartyMongo({
          name: party.name,
          date: party.date,
          activity: {
            name: activity.name,
            description: activity.description,
          },
          isagroup: party.isagroup,
          users: users,
        });
        activity = null;
        partyMongo.save();
        //console.log('saved');
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
