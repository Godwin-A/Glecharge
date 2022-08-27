const express = require('express')
const router = express.Router()
const buy_tv   = require('../utils/buy_tv')
const btoa = require('btoa');
const axios = require('axios').default;
const mongoose = require('mongoose');
const Payer = require('../models/payer');

router.get('/home', (req, res)=>{
  res.render('home')
})

module.exports = router
