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
const dotenv = require('dotenv');
const User = require('./models/user');

const Wallet = require('./models/wallet')
const WalletTransaction = require('./models/wallet_transaction')
const Transaction = require('./models/transaction')
const verifyWallet = require('./utils/validateWalllet')
const updateWallet = require('./utils/updateWallet')
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
const user_route    = require('./routes/user');
const { rearg } = require('lodash');

// use routes 
app.use('/', airtime_route);
app.use('/', data_route);
app.use('/', tv_route);
app.use('/', power_route);
app.use('/', home_route);
app.use('/', jamb_route);
app.use ('/', user_route)

app.post('/transfer-funds', async(req, res)=>{
  const {userEmail , amount , recipient, recipientEmail}  = req.body
  // first thing is to make sure that the wallet exists
  const customer = await User.findOne({email:userEmail})
  const user = await Wallet.findOne({userId:customer._id})
  console.log(`user wallet found ${user}`)
  const sender = await verifyWallet(user.userId)
  // then make sure the money to be transferred is up to expected amount 
    if(sender.balance >= amount){
      try {
         // then verify the recipients account number
         const receiver =  await Wallet.findOne({accountNumber: recipient })
         if(receiver){
            // do the transfer 
           //debit the sender
           const debit = sender.balance - amount 
        const senderWalletBalance =   await updateWallet(user.userId, debit);
         //Update / credit the receiver 
        const credit = Number(receiver.balance) + Number(amount)  
        const receiving =  await  User.findOne({email:recipientEmail })
        const recipientWallet = await verifyWallet(receiving._id)
        const recipientWalletBalance = await updateWallet(receiving._id, credit)
        res.send('TRANSACTION SUCCESSFULL!!!')
         }
      } catch (error) {
         console.log(`Something went wrong  ${error}`) 
      }
       
    }else{
      console.log(' insufficient funds, please fund your wallet ')
      res.send('you dont have sufficient funds in your wallet ,please fund it now ')
    }
})



app.post('/fund-wallet', (req, res)=>{
  // fund wallet route !!
  // get req body 
  const {} = req.body 

})

const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log(`server started in port ${PORT}`);
});