//const User = require('../models/user');
const Wallet = require('../models/wallet')
const WalletTransaction = require('../models/wallet_transaction')
const Transaction = require('../models/transaction')

module.exports = async(userId)=>{
    try{
      console.log(userId)
        const wallet = await Wallet.findOne({userId})
        if(!wallet){
          console.log('there was no wallet found at first, creating new wallet!!')
          const wallet = Wallet.create({
            userId
          })
          console.log('wallet creation successful!!!')
          return wallet
        }  
        return wallet
    }catch{
  console.log('ooops, there was an error!!!')
    }
  }