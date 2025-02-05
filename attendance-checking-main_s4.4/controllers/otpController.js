const Otp = require('../models/otpModel');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const User = require('../controllers/studentController');
const Student = require('../models/studentModel');
const Teacher = require('../models/teacherModel');
const crypto = require('crypto');

exports.addOtp = async (req, res) => {
    const { userId, email } = req.body;
    console.log('Received userId:', userId);
    console.log('Received email:', email);
  
    if (!userId || !email) {
      return res.status(400).json({ error: 'User ID and email are required' });
    }
  
    try {
      const otpCode = crypto.randomInt(100000, 999999).toString();
      const expiration = new Date(Date.now() + 10 * 60 * 1000);
  
      console.log('Deleting existing OTPs...');
      await Otp.deleteMany({ userId });
  
      console.log('Creating new OTP...');
      await Otp.create({
        userId,
        email,
        otp: otpCode,
        expirationDate: expiration,
        check: false
      });
  
      console.log('Sending email...');
      await sendOtpEmail(email, otpCode);
  
      console.log('All operations completed successfully');
      return res.json({ success: true, otp: otpCode });
  
    } catch (error) {
      // Добавим детальное логирование ошибки
      console.error('Error in addOtp:', error);
      return res.status(500).json({ 
        error: 'Server error', 
        details: error.message 
      });
    }
};

exports.getOTPByUserID = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const otp = await Otp.findOne({ userId });
        if (!otp) {
            return res.status(404).json({ error: 'OTP not found' });
        }

        res.json({ success: true, otp });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.checkOTP = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({ error: 'User ID and OTP are required' });
    }

    try {
        const storedOtp = await Otp.findOne({ userId, otp, check: false });

        if (!storedOtp) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        if (new Date() > storedOtp.expirationDate) {
            await Otp.deleteOne({ _id: storedOtp._id }); // Удаляем просроченный OTP
            return res.status(400).json({ error: 'OTP expired' });
        }

        storedOtp.check = true;
        await storedOtp.save();

        res.json({ success: true, message: 'OTP verified' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.isOtpVerified = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID ' });
    }

    try {
        const storedOtp = await this.getOTPByUserID({ userId });

        if (!storedOtp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        if (storedOtp.check) {
            return res.json({ success: true, message: 'OTP already verified' });
        }

        if (new Date() > storedOtp.expirationDate) {
            await Otp.deleteOne({ _id: storedOtp._id }); 
            return res.status(400).json({ error: 'OTP expired' });
        }

        res.json({ success: false, message: 'OTP not verified yet' });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.changePassword = async (req, res) => {
    const { userId, password } = req.body;
    
    if (!userId || !password) {
        return res.status(400).json({ error: 'User ID and new password are required' });
    }

    try {
        // Добавим логирование для отладки
        console.log('Changing password for userId:', userId);

        // Сначала ищем в Student
        let user = await Student.findOne({ id: Number(userId) });
        console.log('Found student:', user);

        // Если не нашли в Student, ищем в Teacher
        if (!user) {
            user = await Teacher.findOne({ id: Number(userId) });
            console.log('Found teacher:', user);
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Проверяем OTP
        const storedOtp = await Otp.findOne({ userId });
        if (!storedOtp || !storedOtp.check) {
            return res.status(400).json({ success: false, message: 'OTP not verified' });
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Обновляем пользователя напрямую через модель
        const isStudent = user.constructor.modelName === 'Student';
        const Model = isStudent ? Student : Teacher;
        
        const updatedUser = await Model.findOneAndUpdate(
            { id: Number(userId) },
            { $set: { password: hashedPassword } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'Failed to update user' });
        }

        res.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Error in changePassword:', error);
        res.status(500).json({ error: 'Server error while changing password' });
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "anuar.musljumov@gmail.com",
        pass: "jmhchhrlfeuwljrs",
    },
});
const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
      from: "anuar.musljumov@gmail.com",
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
      html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.response}`); // Заменили logger.info на console.log
      return {
        success: true,
        message: 'OTP sent successfully!',
      };
    } catch (error) {
      console.error(`Error sending email: ${error.message}`); // Заменили logger.error на console.error
      throw error; // Пробрасываем ошибку дальше для корректной обработки
    }
  };