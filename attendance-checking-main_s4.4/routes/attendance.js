const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendanceModel');
const Students = require('../models/studentModel');
const attendanceController = require('../controllers/attendanceController');

// Маршруты для посещаемости
router.get('/', attendanceController.getAllAttendance); // Получить все записи
router.post('/', attendanceController.addAttendance); // Добавить новую запись
router.get('/:id', attendanceController.getAttendanceById); // Получить запись по ID
router.put('/:id', attendanceController.updateAttendance); // Обновить запись
router.delete('/:id', attendanceController.deleteAttendance); // Удалить запись

// Эндпоинт для получения данных ученика по userId
router.get('/student/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Находим записи из коллекции attendances по userId
        const attendanceData = await Attendance.find({ userId });

        // Если данных нет, отправляем сообщение
        if (!attendanceData || attendanceData.length === 0) {
            return res.status(404).json({ error: 'Данные для указанного пользователя не найдены' });
        }

        // Возвращаем данные ученика
        res.status(200).json(attendanceData);
    } catch (error) {
        console.error('Ошибка получения данных посещаемости:', error);
        res.status(500).json({ error: 'Ошибка сервера. Попробуйте позже.' });
    }
});

router.get('/students/mega', async (req, res) => {
    try {
        const attendanceData = await Students.find(); // добавлены ()
        
        // Если данных нет, отправляем сообщение
        if (!attendanceData || attendanceData.length === 0) {
            return res.status(404).json({ error: 'Данные для указанного пользователя не найдены' });
        }
        
        res.status(200).json(attendanceData);
    } catch (error) {
        console.error('Ошибка получения данных посещаемости:', error);
        res.status(500).json({ error: 'Ошибка сервера. Попробуйте позже.' });
    }
});

module.exports = router;
