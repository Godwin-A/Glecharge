const express = require('express')
const router = express.Router()
router.use(express.urlencoded({ extended: true }));
router.use(express.json({ extended: true }));
const buy_electricity = require('../utils/electricity');
const btoa = require('btoa');
const axios = require('axios').default;
const mongoose = require('mongoose');
const Payer = require('../models/payer');
const fetch =  require('node-fetch');
const { forwardAuthenticated , ensureAuthenticated } = require('../config/auth');
const User = require('../models/user');
const updateWallet = require('../utils/updateWallet')
const createWalletTransaction = require('../utils/createWalletTransaction')
const createTransaction = require('../utils/createTransaction')
const verifyWallet = require('../utils/validateWalllet')
// electricity route
router.get('/merchant/verify',ensureAuthenticated, function (req, res) {
  res.render('power');
});

router.post('/merchant/data', async (req, res) => {
  const { meter_number, type, service_id } = req.body;
  const options = {
    headers: {
      Authorization: 'Basic ' + btoa('sandbox@vtpass.com:sandbox'),
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      serviceID: service_id,
      billersCode: meter_number,
      type: type,
    }),
  };
  const result = await fetch(
    new URL('https://sandbox.vtpass.com/api/merchant-verify'),
    options
  );
  if (result) {
    try {
      console.log('there is a result , hurray!!!!!');
      // console.log(result)
      const json = await result.json().then((res) => {
        return res;
      });
      console.log(json);
      const { Customer_Name, MeterNumber, Address, Meter_Type } = json.content;
      res.render('buy_power', {
        Customer_Name,
        MeterNumber,
        Address,
        Meter_Type,
        service_id,
      });
    } catch (error) {
      console.log(`there was an error ${error}`);
    }
  }
});

router.get('/buy_electricity', ensureAuthenticated,async (req, res) => {
  const realUserEmail = req.user.email 
  const { MeterNumber , Meter_Type,  amount, phone, service_id } = req.query;
  console.log('this is the service id '+ req.query)
      const user = await User.findOne({email:realUserEmail})
      if (user) {
        try {
          const min = 10000;
        const max = 99999;
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        const date = new Date();
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1 < 10 ? '0' : ''}${
          date.getMonth() + 1
        }`;
        const hour = `${date.getHours() < 10 ? '0' : ''}${date.getHours()}`;
        const seconds = `${
          date.getSeconds() < 10 ? '0' : ''
        }${date.getSeconds()}`;
        const minutes = `${
          date.getMinutes() < 10 ? '0' : ''
        }${date.getMinutes()}`;
        const daten = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`;
        const requestId = `${year}${month}${daten}${hour}${minutes}${seconds}${num}`;
      const wallet = await verifyWallet(user._id)
      console.log(`this is the user wallet ${wallet}`)
    // await createWalletTransaction(user._id, status='successful',amount);
    // await createTransaction(user._id, transaction_id, status='successful', amount, customer);
    if(wallet.balance >= amount){
      try {
        const walletBalance = Number(wallet.balance) - Number(amount)  
        await updateWallet(user._id, walletBalance);
        const result = await buy_electricity(
          requestId,
          Meter_Type,
          MeterNumber,
          amount,
          service_id,
          phone
        );
        const token = result.Token;
        console.log(result, token)
          res.render('show_token', { token });
      } catch (error) {
        console.log(`insufficient funds in wallet ${error}` )
      }
  
    }
        } catch (error) {
          console.log(`there was an error ${error}`)
        }
        
      } else{
        res.send('there is no user for this email address')
      }
 
});


module.exports = router