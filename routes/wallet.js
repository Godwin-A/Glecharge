const express = require('express')
const router = express.Router()
const axios = require('axios').default;
const mongoose = require('mongoose');
const User = require('../models/user');
const Wallet = require('../models/wallet')
const { forwardAuthenticated } = require('../config/auth');
const WalletTransaction = require('../models/wallet_transaction')
const Transaction = require('../models/transaction')
const verifyWallet = require('../utils/validateWalllet')
const updateWallet = require('../utils/updateWallet')



router.post('/transfer-funds', async(req, res)=>{
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

  router.get('/wallet-fund', async(req, res)=>{
    res.render('fund-wallet')
  })


  router.get('/fund-wallet', async(req, res)=>{
    // fund wallet route !!
  
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
        const walletFunder = {
          email: response.data.data.customer.email,
          reference: response.data.data.tx_ref,
          amount: response.data.data.amount,
          number: response.data.data.customer.phone_number,
        };
    const userEmail = walletFunder.email
        const user =  await User.findOne({email:userEmail})
        console.log('user found , moving onto wallet verification')
  
        const UserWalletId = user._id 
        console.log(UserWalletId)
        const userWallet = await verifyWallet(UserWalletId)
        console.log(`user wallet found ${userWallet}`)
     const fundedBalance =   Number(userWallet.balance) + Number(walletFunder.amount)
      console.log(`${fundedBalance}`)
      const fundedWallet = await updateWallet(UserWalletId, fundedBalance)
      console.log(fundedWallet)
       res.redirect('/home')
      } catch (error) {
        console.log(`invalid credentials ${error}`);
      }
    }else{
      console.log('no response received')
      res.send('No Response Provided')
    }
  
  })

  
  module.exports = router