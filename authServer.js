require('dotenv').config();

const express = require('express');

const app = express();

app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API running.'));

app.use('/api/login', require('./api/login'));
app.use('./api/register', require('./api/register'));
app.use('./api/token', require('./api/token'));

const port = process.env.PORT || 3001;

app.listen(port, () => console.log('Server started on port '+ port));
