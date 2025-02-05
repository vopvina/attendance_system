const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    email: { type: String, required: true }, 
    otp: { type: String, required: true},
    expirationDate: { type: Date, required: true},
    check: { type: Boolean, required: true }
});

module.exports = mongoose.model('otp', otpSchema);
