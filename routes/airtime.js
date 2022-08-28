const express = require('express')
const buy_airtime = require('../utils/airtime');
const router = express.Router()
const axios = require('axios').default;
const mongoose = require('mongoose');
const Payer = require('../models/payer');
const { forwardAuthenticated , ensureAuthenticated } = require('../config/auth');

router.get('/airtime', ensureAuthenticated,  (req, res) => {
  res.render('airtime');
});



//buy airtime route
router.get('/airtime/verify', ensureAuthenticated, async (req, res) => {
  const { transaction_id } = req.query;
  const url = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;
  const response = await axios({
    url,
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `FLWSECK_TEST-cfb4553d9ad6e8573502240f1258b60a-X`,
    },
  });
  if (response) {
    try {
      console.log(response.data.data);
      const payerDetails = {
        full_name: response.data.data.customer.name,
        reference: response.data.data.tx_ref,
        amount: response.data.data.amount,
        email: response.data.data.customer.email,
        number: response.data.data.customer.phone_number,
      };
      const service_id = response.data.data.meta.service_id;
      console.log(service_id);
      const payerOne = new Payer(payerDetails);
      await payerOne.save();
      if (payerOne) {
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
        res.send(`transaction successful ${payerOne.full_name}`);
        buy_airtime(
          requestId,
          service_id,
          payerDetails.amount,
          payerDetails.number
        );
      } else {
        console.log('there was an error');
      }
    } catch (error) {
      console.log(`there was an error ${error}`);
    }
  }
});


module.exports = router