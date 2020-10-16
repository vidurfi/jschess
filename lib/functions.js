const jwt = require('jsonwebtoken')

module.exports ={
  generateAccessToken: (user) => jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}
