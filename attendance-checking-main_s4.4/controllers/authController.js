const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');
const Token = require('../models/tokenModel'); // Модель для хранения токенов

exports.login = async (req, res) => {
    const { username, password, deviceId } = req.body;
    
    try {
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user
        let user = await Teacher.findOne({ login: username });
        let role = 'teacher';
        
        if (!user) {
            user = await Student.findOne({ login: username });
            role = 'student';
        }

        // Debug logs
        console.log('Found user:', user ? 'yes' : 'no');
        console.log('Role:', role);
        console.log('Device ID:', deviceId);

        // Check if user exists and password is correct
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const tokenPayload = { 
            id: user._id, 
            role, 
            deviceId 
        };
        console.log('Token payload:', tokenPayload);

        const token = jwt.sign(
            tokenPayload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // Delete old tokens
        console.log('Deleting old tokens for user:', user._id);
        await Token.deleteMany({ userId: user._id });

        // Create new token
        console.log('Creating new token record');
        const newToken = await Token.create({ 
            userId: user._id, 
            token, 
            deviceId 
        });
        console.log('New token created:', newToken ? 'yes' : 'no');

        // Set cookie and send response
        res.cookie('auth_token', token, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return res.json({ 
            success: true, 
            token, 
            role,
            userId: user._id
        });

    } catch (err) {
        // Detailed error logging
        console.error('Login error details:', {
            message: err.message,
            stack: err.stack,
            code: err.code
        });

        // Check for specific error types
        if (err.name === 'JsonWebTokenError') {
            return res.status(500).json({ error: 'Error generating token' });
        }
        
        if (err.name === 'MongoError') {
            return res.status(500).json({ error: 'Database error' });
        }

        return res.status(500).json({ 
            error: 'Server error', 
            details: process.env.NODE_ENV === 'development' ? err.message : undefined 
        });
    }
};
