const express = require('express')
const router = express.Router()
const buy_electricity = require('../utils/electricity');
const btoa = require('btoa');
const axios = require('axios').default;
const mongoose = require('mongoose');
const Payer = require('../models/payer');
const fetch =  require('node-fetch');
const { forwardAuthenticated , ensureAuthenticated } = require('../config/auth');

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
      const payerDetails = {
        full_name: response.data.data.customer.name,
        reference: response.data.data.tx_ref,
        email: response.data.data.customer.email,
        amount: response.data.data.amount,
        number: response.data.data.customer.phone_number,
      };
      console.log(payerDetails);
      const service_id = response.data.data.meta.service_id.trim();
      const MeterNumber = response.data.data.meta.MeterNumber.trim();
      const Address = response.data.data.meta.Address;
      const Meter_Type = response.data.data.meta.Meter_Type;
      const variation_code = Meter_Type.toLowerCase().trim();
      // console.log(`take a look at the meter number  and customer name -- ${MeterNumber} and ${payerDetails.full_name} and ${service_id}`)
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
        let phone = Number(payerDetails.number);
        // console.log(requestId,Meter_Type, MeterNumber,payerDetails.amount,service_id, payerDetails.number)
        const result = await buy_electricity(
          requestId,
          variation_code,
          MeterNumber,
          payerDetails.amount,
          service_id,
          payerDetails.number
        );
        const token = result.Token;
        console.log(token);
        res.render('show_token', { token });
      } else {
        console.log('there was an error');
      }
    } catch (error) {
      console.log(`its not you, its us, sorry for the error ${error}`);
    }
  }
});


module.exports = router