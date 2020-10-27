const express = require('express');
const connectDB = require('./config/db');
const connectDBMongo = require('./config/dbmongo');
const app = express();

// Connection to the database
connectDB
  .authenticate()
  .then(() => console.log('Database connected'))
  .catch((err) => console.log('Error: ' + err));

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
app.use('/restapi/auth', require('./restapi/auth'));
app.use('/restapi/users', require('./restapi/users'));
app.use('/restapi/parties', require('./restapi/parties'));
app.use('/restapi/activity', require('./restapi/activity'));

const PORT = process.env.PORT || 5017;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
