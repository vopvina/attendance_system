const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const { connectDB } = require('./config/db');
const teacherRoutes = require('./routes/teacherRoutes');
const attendanceRoutes = require('./routes/attendance');
const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp');
const open = require('open');
const {
    checkDBConnection,
    dbErrorHandler,
    authErrorHandler,
    generalErrorHandler,
    notFoundHandler,
    authMiddleware
} = require('./middleware/middleware');

dotenv.config();
const app = express();

// Флаг состояния подключения к базе данных
let isDBConnected = false;

// Подключение к базе данных
const initializeDatabase = async () => {
    isDBConnected = await connectDB();
};

// Проверяем подключение при запуске
initializeDatabase();

// Middleware для парсинга JSON и cookie
app.use(express.json());
app.use(cookieParser());

// Корневой маршрут отдает login.html из папки public
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Маршрут для /index отдаёт файл index.html из папки public
app.get('/index', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Маршрут для /index отдаёт файл index.html из папки public
app.get('/student', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'student.html'));
});

// Устанавливаем папку public как статичную для раздачи файлов
app.use(express.static(path.join(__dirname, 'public')));

// Middleware для проверки подключения к базе данных
const checkDBMiddleware = (req, res, next) => {
    if (!isDBConnected) {
        return res.status(503).json({ error: 'База данных недоступна. Попробуйте позже.' });
    }
    next();
};

// Роуты с проверкой подключения
app.use('/teachers', checkDBMiddleware, teacherRoutes);
app.use('/attendance', checkDBMiddleware, attendanceRoutes);
app.use('/auth', checkDBMiddleware, authRoutes);
app.use('/otp', checkDBMiddleware, otpRoutes) 

// Используем обработчики ошибок
app.use(dbErrorHandler); // Обработчик ошибок подключения к базе данных
app.use(authErrorHandler); // Обработчик ошибок авторизации
app.use(notFoundHandler); // Обработчик ошибок 404
app.use(generalErrorHandler); // Общий обработчик ошибок
app.use(generalErrorHandler);  // Обработчик ошибок токена

// Используем значение PORT из .env или задаем значение по умолчанию (3000)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
