const functions = require('../lib/functions.js')
const { check, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const {MongoClient, connect} = require('mongodb')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// @route  POST api/login
// @desc   Authenticate user and get token
// @access public
router.post('/', 
    [
        check('email', 'Please enter a valid email!').isEmail(),
        check('password', 'Please include a password!').exists(),
    ],
    async (req, res) =>{
    const client = new MongoClient(process.env.MONGO_AUTH_URI, { useUnifiedTopology: true, useNewUrlParser: true, })
    try {
      await client.connect()
      const database = client.db("chess-auth")
      const users = database.collection("user-data")
      const refreshTokens = database.collection("refresh-tokens")
      const queryEmail = { email: req.body.email }
      users.findOne(queryEmail, (err, result) => {
        if (err) {
          res.status(500).send(err.message + " 1")
        } else
        if (result === null){
          res.status(400).send('Password or email is incorrect!')
        } else
        bcrypt.compare(req.body.password, result.password, (err, same) => {
          if (err) {
            res.status(500).send(err.message + " 2")
          } else
          if (same) {
            const accessToken = functions.generateAccessToken(result)
            const refreshToken = jwt.sign(result, process.env.REFRESH_TOKEN_SECRET)
            const token = {
              token: refreshToken
            }
            refreshTokens.insertOne(token);
            res.json({ accessToken: accessToken, refreshToken: refreshToken }).status(200).send()
          } else {
            res.status(400).send('Password or email is incorrect!')
          }
        })
      }, () => {
        client.close()
      })
    } catch {
      client.close()
      res.sendStatus(500)
    } 
  })

module.exports = router;
