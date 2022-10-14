const Wallet = require('../models/wallet')
const WalletTransaction = require('../models/wallet_transaction')
const Transaction = require('../models/transaction')

module.exports = async(userId)=>{
    try{
        const wallet = await Wallet.findOne({userId})
        if(!wallet){
          const wallet = Wallet.create({
            userId
          })
          console.log('wallet validation successful!!!')
          return wallet
        }
        return wallet
    }catch{
  console.log('ooops, there was an error!!!')
    }
  }