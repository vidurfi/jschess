require('dotenv').config()

const express = require('express')
const jwt = require('jsonwebtoken')
const mongo = require('mongodb')

const app = express()
app.use(express.json())

const posts = [
    {
        username: 'Vid',
        title: 'posta'
    },
    {
        username: 'Bob',
        title: 'card'
    }
];

app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name))
})

function authenticateToken(req, res, next) {
    const accessToken = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]
    if ( accessToken == null ) return res.sendStatus(401);
    
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403);
        req.user = user
        next()
    })
}


app.listen(3000)
