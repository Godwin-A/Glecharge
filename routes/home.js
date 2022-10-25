const express = require('express')
const router = express.Router()
const btoa = require('btoa');
const axios = require('axios').default;
const mongoose = require('mongoose');
const Payer = require('../models/payer');
const User = require('../models/user');
const Wallet = require('../models/wallet')
const { forwardAuthenticated } = require('../config/auth');
const verifyWallet = require('../utils/validateWalllet')

router.get('/home',  async(req, res)=>{
  if(req.user){
    console.log(req.user)
    try {
         const userEmail = req.user.email
   const user = await  User.findOne({email:userEmail})
   const userWallet = await verifyWallet(user._id)
   const userWalletBalance = userWallet.balance
   console.log(userWalletBalance)
  res.render('home', {wallet: userWalletBalance})
    } catch (error) {
      console.log(`${error}`)
    }
  }else{
     res.render('home')
  }
})

module.exports = router
