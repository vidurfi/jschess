const express = require('express');
const router = express.Router();
const {MongoClient, connect} = require('mongodb')
const jwt = require('jsonwebtoken')

// @route  POST api/token
// @desc   Generate new access token and refresh token from refresh token
// @access public
router.post('/', async (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    const client = new MongoClient(mongoURI, { useUnifiedTopology: true, useNewUrlParser: true, }) 
    try {
      await client.connect()
      const refreshTokens = client.db("chess-auth").collection("refresh-tokens")
      const queryToken = { token: refreshToken }
      refreshTokens.findOneAndDelete(queryToken, async (err, result) => {
        if (err) {
          client.close()
          return res.status(500).send(err.message)
        }
        if (result.value === null) {
          client.close()
          return res.sendStatus(403)
        } else {
          jwt.verify(result.value.token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403)
            const accessToken = generateAccessToken({ email: user.email })
            const newRefreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '3 days'}) //TODO: fix payload
            const token = {
              token: newRefreshToken
            }
            refreshTokens.insertOne(token, () => {
              client.close()
            }) 
            return res.json({ accessToken: accessToken, refreshToken: newRefreshToken })
          })
        }
      })
    } catch {
      client.close()
      return res.sendStatus(500)
    }
  })

module.exports = router
