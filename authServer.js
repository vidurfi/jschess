require('dotenv').config()

const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {MongoClient, connect} = require('mongodb')

/**
 * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
 * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
 */
const uri = "mongodb+srv://"+process.env.CHESS_AUTH_SERVER_USERNAME+":"+process.env.CHESS_AUTH_SERVER_PASS+"@"+process.env.MONGO_CLUSTER+".g4ru6.mongodb.net/?retryWrites=true&w=majority";

const app = express()

app.use(express.json())

const users = []

let refreshTokens = [] //Database :MONGO?

app.post('/token', (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401)
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    const accessToken = generateAccessToken({ email: user.email })
    res.json({ accessToken: accessToken })
  })
})

app.post('/login', async (req, res) =>{
  try {
    const client = new MongoClient(uri)
    await client.connect()
    const users = client.db("chess-auth").collection("user-data")
    const queryEmail = { email: req.body.email }
    users.findOne(queryEmail, async (err, result) => {
      if (err) {
        client.close()
        return res.status(500).send(err.message)
      }
      if (result === null){
        client.close()
        return res.status(400).send('Password or email is incorrect!')
      }
      bcrypt.compare(req.body.password, result.password, (err, same) => {
        if (err) {
          client.close()
          return res.status(500).send(err.message)
        }
        if (same) {
          const accessToken = generateAccessToken(result)
          const refreshToken = jwt.sign(result, process.env.REFRESH_TOKEN_SECRET)
          //refreshTokens.push(refreshToken) //TODO: Add refresh token to token database
          client.close()
          return res.json({ accessToken: accessToken, refreshToken: refreshToken }).status(200).send()
        } else {
          client.close()
          return res.status(400).send('Password or email is incorrect!')
        }
      })
    })
  } catch {
    client.close()
    return res.sendStatus(500)
  } 
})

app.post('/register', async (req, res) =>{
  try{
    const client = new MongoClient(uri)
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

function generateAccessToken (user){
  return jwt.sign( user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

app.listen(4000)
