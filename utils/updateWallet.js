const Wallet = require('../models/wallet')
const WalletTransaction = require('../models/wallet_transaction')
const Transaction = require('../models/transaction')

// Update wallet 
module.exports = async (userId, amount) => {
    try {
      // update wallet
      const wallet = await Wallet.findOneAndUpdate(
        { userId },
        {  balance: amount  },
        { new: true }
      );
      return wallet;
    } catch (error) {
      console.log(error);
    }
  };