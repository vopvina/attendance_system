const express = require('express');
const router = express.Router();
const OtpController = require('../controllers/otpController');

router.use(express.json());

router.post('/add', OtpController.addOtp);
router.get('/get/:userId', OtpController.getOTPByUserID);
router.post('/check', OtpController.checkOTP);
router.post('/change/password', OtpController.changePassword);

module.exports = router;
