const { check, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const {MongoClient, connect} = require('mongodb')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// @route  POST api/register
// @desc   Register user
// @access public
router.post('/',
    [
        check('email', 'Please enter a valid email!').isEmail(),
        check('password', 'Please include a password!').exists(),
    ], 
    async (req, res) =>{
    const client = new MongoClient(mongoURI, { useUnifiedTopology: true, useNewUrlParser: true, })
    try{
      await client.connect()
      const users = client.db("chess-auth").collection("user-data")
      const queryEmail = { email: req.body.email }
      const queryUsername = { username: req.body.username }
      if (await users.countDocuments(queryEmail) !== 0){ //look for email
        client.close()
        return res.status(400).send("Email already taken!")
      } else {
        if (await users.countDocuments(queryUsername) !== 0) { //look for username
          client.close()
          return res.status(400).send("Username already exists!")
        } else {
          const hashedPassword = await bcrypt.hash(req.body.password, 10)
          const user = {
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email
          }
          users.insertOne(user)
          client.close()
          return res.sendStatus(201)
        }
      }
    } catch {
      client.close()
      return res.sendStatus(500)
    }
  })

module.exports = router

