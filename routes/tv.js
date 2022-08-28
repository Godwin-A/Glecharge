const express = require('express')
const router = express.Router()
const buy_tv   = require('../utils/buy_tv')
const btoa = require('btoa');
const axios = require('axios').default;
const mongoose = require('mongoose');
const Payer = require('../models/payer');
const { forwardAuthenticated , ensureAuthenticated } = require('../config/auth');

router.get('/tv_subscription', ensureAuthenticated,async (req, res) => {
  res.render('tv');
});

router.post('/verify_smartcard', ensureAuthenticated,async (req, res) => {
  const { card, serviceID } = req.body;
  const options = {
    headers: {
      Authorization: 'Basic ' + btoa('sandbox@vtpass.com:sandbox'),
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      serviceID: serviceID,
      billersCode: card,
    }),
  };
  const result = await fetch(
    new URL('https://sandbox.vtpass.com/api/merchant-verify'),
    options
  );
  if (result) {
    try {
      //humor makes coding more fun :)
      console.log('there is a result , hurray!!!!!');
      const json = await result.json().then((res) => {
        return res;
      });
      console.log(json);
      const { Customer_Name, Customer_Type, DUE_DATE, Customer_Number } =
        json.content;
      res.render('buy_tv', {
        Customer_Name,
        Customer_Type,
        DUE_DATE,
        Customer_Number,
        serviceID,
      });
    } catch (error) {
      console.log(`there was an error ${error}`);
    }
  }
});
// fetch(new URL("https://sandbox.vtpass.com/api/service-variations?serviceID=dstv"))
// .then(res => res.json())
// .then(json => console.log(json.content.varations))

router.get('/buy_tv',ensureAuthenticated, async(req, res)=>{
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
  if(response){
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
      const Customer_Number = response.data.data.meta.Customer_Number.trim();
      const variation_code = response.data.data.meta.variation_code;
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
        const result = await buy_tv(
          requestId,
          variation_code,
          service_id,
          Customer_Number,
          payerDetails.number
        );
        if(result == 'TRANSACTION SUCCESSFUL'){
          res.send('go enjoy yourself chief,abeg do giveaway :)')
        }else{
          res.send('omo this thing no work oo, nothing for you :())')
        }
        }else{
          console.log('there was an error')
        }
    } catch (error) {
      console.log(error)
    }
  }
})

module.exports = router
