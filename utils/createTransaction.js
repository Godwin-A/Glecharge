const Wallet = require('../models/wallet')
const WalletTransaction = require('../models/wallet_transaction')
const Transaction = require('../models/transaction')

// Create Transaction
module.exports = async ( userId, id, status, amount, customer) => {
    try {
      // create transaction
      const transaction = await Transaction.create({
        userId,
        transactionId: id,
        name: customer.full_name,
        email: customer.email,
        phone: customer.number,
        amount,
        currency:'NGN',
        paymentStatus: status,
        paymentGateway: "flutterwave",
      });
      return transaction;
    } catch (error) {
      console.log(`ooops, there was an error ${error}`);
    }
  };