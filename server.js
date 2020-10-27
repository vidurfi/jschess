const express = require('express');
const connectDBMongo = require('./config/dbmongo');
const app = express();

connectDBMongo();

// Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

// Define Routes

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, x-auth-token, Content-Type, Accept'
  );
  next();
});
app.use('/api/login', require('./api/login'));
app.use('/api/register', require('./api/register'));

const PORT = process.env.PORT || 5017;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
