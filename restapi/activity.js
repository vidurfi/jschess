const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const Activity = require('../models/Activity');
const ActivityMongo = require('../models/mongo/Activity');

// @route   GET restapi/activity
// @desc    Get all activity
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const activity = await Activity.findAll();
    res.json({ activity });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST restapi/activity
// @desc    Create an activity
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Activity name is required').not().isEmpty(),
      check('description', 'Description can not be empty').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //Check if it is not exists already
      let activity = await Activity.findOne({ where: { name: req.body.name } });

      if (activity) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Activity already exists.' }] });
      }
      //Creating the activity
      activity = new Activity({
        name: req.body.name,
        description: req.body.description,
      });
      await activity.save();
      res.json(activity);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

//MODIFIED FOR THE FRONT END INITIALIZATION
// @route   POST restapi/activity/initialize
// @desc    Create an activity
// @access  Private
router.post('/initialize', async (req, res) => {
  try {
    //Check if it is not exists already

    //Creating the activity
    activity = new Activity({
      name: req.body.name,
      description: req.body.description,
    });
    await activity.save();
    res.status(200).send('ok');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/migrate', async (req, res) => {
  try {
    console.log('migrating activities');
    const activityAll = await Activity.findAll();
    try {
      await activityAll.forEach((activity) => {
        activityMongo = new ActivityMongo({
          id: activity.id,
          name: activity.name,
          description: activity.description,
        });
        activityMongo.save();
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
