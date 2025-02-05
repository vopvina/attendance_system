const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Token = require('../models/tokenModel');

// проверки соединения с базой данных
const checkDBConnection = (req, res, next) => {
    if (mongoose.connection.readyState === 1) { // 1 - подключение активно
        next();
    } else {
        res.status(503).json({ error: 'Сервис временно недоступен. Попробуйте позже.' });
    }
};

// Обработчик ошибок подключения к базе данных
const dbErrorHandler = (err, req, res, next) => {
    if (err.name === 'MongoNetworkError' || err.message.includes('failed to connect')) {
        console.error('Database connection error:', err.message);
        return res.status(500).json({
            error: 'Ошибка подключения к базе данных. Попробуйте позже.',
        });
    }
    next(err);
};

// Обработчик ошибок авторизации
const authErrorHandler = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        console.error('Authorization error:', err.message);
        return res.status(401).json({
            error: 'Ошибка авторизации. Пожалуйста, войдите в систему.',
        });
    }
    next(err);
};

// Обработчик для ошибок 404 (страница не найдена)
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        error: 'Страница не найдена.',
    });
};

// Общий обработчик ошибок
const generalErrorHandler = (err, req, res, next) => {
    console.error('Server error:', err.message);
    res.status(500).json({
        error: 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.',
    });
};

// Обработчик ошибок токена
const authMiddleware = async (req, res, next) => {
    const token = req.cookies.auth_token;
    const deviceId = req.headers['device-id']; // Получаем deviceId из заголовка

    if (!token) {
        return res.redirect('/'); // Нет токена – перенаправляем на логин
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Проверяем, существует ли токен в базе
        const storedToken = await Token.findOne({ userId: decoded.id }).lean();
        
        if (!storedToken) {
            console.log(`Токен не найден! userId=${decoded.id}`);
            res.clearCookie('auth_token');
            return res.redirect('/');
        }

        if (storedToken.token !== token) {
            res.clearCookie('auth_token');
            return res.redirect('/');
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie('auth_token');
        return res.redirect('/');
    }
};

module.exports = {
    checkDBConnection,
    dbErrorHandler,
    authErrorHandler,
    generalErrorHandler,
    notFoundHandler,
    authMiddleware,
};
