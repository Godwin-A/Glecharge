const Wallet = require('../models/wallet')
const WalletTransaction = require('../models/wallet_transaction')
const Transaction = require('../models/transaction')

// Create Wallet Transaction
module.exports = async (userId, status, amount) => {
    try {
      // create wallet transaction
      const walletTransaction = await WalletTransaction.create({
        amount,
        userId,
        isInflow: true,
        currency:'NGN',
        status,
      });
      return walletTransaction;
    } catch (error) {
      console.log(`Ooops there was an error ${error}`);
    }
  };

