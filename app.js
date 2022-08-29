const express = require('express');
const mongoose = require('mongoose');
const { json, response } = require('express');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
require('./config/passport')(passport);
const { forwardAuthenticated , ensureAuthenticated } = require('./config/auth');
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

  app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );

  app.use(passport.initialize());
app.use(passport.session());


// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes 
const airtime_route = require('./routes/airtime')
const data_route    = require('./routes/data')
const tv_route      = require('./routes/tv')
const power_route   = require('./routes/power')
const home_route    = require('./routes/home')
const jamb_route    = require('./routes/jamb')
const user_route    = require('./routes/user')
// use routes 
app.use('/', airtime_route);
app.use('/', data_route);
app.use('/', tv_route);
app.use('/', power_route);
app.use('/', home_route);
app.use('/', jamb_route);
app.use ('/', user_route)


const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log(`server started in port ${PORT}`);
});