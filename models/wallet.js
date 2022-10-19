const mongoose = require('mongoose')

const WalletSchema = new mongoose.Schema({
    balance: {
        type: Number,
        default: 0
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }, 
    accountNumber:{
        type: Number,
        required: true,
        unique: true ,
        default: function addAccountNumber() {
            const number = Math.floor(100000 + Math.random() * 900000);
            return number 
        }
    }
}, { timestamps: true })

 const Wallet = mongoose.model('Wallet', WalletSchema);
 
 module.exports = Wallet