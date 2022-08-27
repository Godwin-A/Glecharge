const express = require('express')
const router = express.Router()
const buy_data = require('../utils/data');
const axios = require('axios').default;
const mongoose = require('mongoose');
const Payer = require('../models/payer');
const btoa = require('btoa')
const buy_pin = require('../utils/jamb')
const fetch =  require('node-fetch');

router.get('/get-jamb', (req, res)=>{
  res.render('jamb')
})


router.post('/jamb/verify', async(req, res)=>{
  const {billersCode , serviceID , type } = req.body
  const optionss = {
    headers: {
  'Authorization':'Basic '+btoa('sandbox@vtpass.com:sandbox'),
  'Content-Type': 'application/json'                   
           },
   method: "POST",
  body: JSON.stringify({         
     'serviceID' : serviceID,
     'billersCode'    : billersCode,
     'type'     : type,
  })
  }
 const result =  await fetch(new URL("https://sandbox.vtpass.com/api/merchant-verify"), optionss)
         .then(response => response.json())
         .then(json => {return json});
         if(result){
          const name = result.content.Customer_Name
          res.render('purchase_jamb', {name, billersCode , type})
         }else{
          res.send('no results found')
         }
})




router.get('/jamb/confirmation', async(req, res)=>{
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
      const variation_code = response.data.data.meta.type;
      const billersCode = response.data.data.meta.billersCode;
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
        res.send(`you have been saved to the database ${payerOne.full_name}`);
    const pin = await buy_pin(requestId, variation_code, service_id,billersCode, payerDetails.number);
    console.log(pin.Pin)
      } else {
        console.log('there was an error');
      }
    } catch (error) {
      console.log(`its not you, its us, sorry for the error ${error}`);
    }
  }
})

module.exports = router