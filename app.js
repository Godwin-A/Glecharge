const express = require('express');
const mongoose = require('mongoose');
const { json, response } = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
const dotenv    =   require('dotenv');
dotenv.config();
const db = process.env.DB_PASS
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => {
    console.log('DB connected successfully');
  })
  .catch((err) => {
    console.log(err);
  });

// Routes 
const airtime_route = require('./routes/airtime')
const data_route    = require('./routes/data')
const tv_route      = require('./routes/power')
const power_route   = require('./routes/power')
const home_route    = require('./routes/home')
const jamb_route    = require('./routes/jamb')

// use routes 
app.use('/', airtime_route);
app.use('/', data_route);
app.use('/', tv_route);
app.use('/', power_route);
app.use('/', home_route);
app.use('/', jamb_route);


const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log(`server started in port ${PORT}`);
});