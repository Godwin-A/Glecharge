const express = require('express')
const router = express.Router()
const buy_data = require('../utils/data');
const axios = require('axios').default;
const mongoose = require('mongoose');
const Payer = require('../models/payer');
const flash = require('connect-flash');
const { forwardAuthenticated , ensureAuthenticated } = require('../config/auth');

router.get('/data', ensureAuthenticated, (req, res) => {
  res.render('data');
});


// buy data route
router.get('/data/approved',ensureAuthenticated, async (req, res) => {
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
    console.log(response.data.data);
    try {
      console.log(response.data.data);
      const payerDetails = {
        full_name: response.data.data.customer.name,
        reference: response.data.data.tx_ref,
        email: response.data.data.customer.email,
        amount: response.data.data.amount,
        number: response.data.data.customer.phone_number,
      };
      const service_id = response.data.data.meta.service_id;
      const variation_code = response.data.data.meta.variation_code;
      console.log(
        `take a look at the service_id and varition code -- ${service_id} and ${variation_code}`
      );
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
        buy_data(requestId, variation_code, service_id, payerDetails.number);
      } else {
        console.log('there was an error');
      }
    } catch (error) {
      console.log(`its not you, its us, sorry for the error ${error}`);
    }
  }
});


 module.exports = router