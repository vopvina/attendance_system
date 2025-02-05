const Attendance = require('../models/attendanceModel');

// Добавление новой записи
exports.addAttendance = async (req, res) => {
    const { userId, date, status } = req.body;

    try {
        // Проверка на наличие записи с тем же userId и date
        const existingRecord = await Attendance.findOne({ userId, date });

        if (existingRecord) {
            return res.status(400).json({ error: 'Attendance already marked for this user on this date.' });
        }

        // Если записи нет, создаём новую
        const newRecord = new Attendance({ userId, date, status });
        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


// Получение всех записей
exports.getAllAttendance = async (req, res) => {
    try {
        const records = await Attendance.find();
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Получение записи по ID
exports.getAttendanceById = async (req, res) => {
    try {
        const record = await Attendance.findById(req.params.id);
        if (!record) return res.status(404).json({ error: 'Record not found' });
        res.json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Обновление записи
exports.updateAttendance = async (req, res) => {
    const { userId, date, status } = req.body;

    try {
        const updatedRecord = await Attendance.findByIdAndUpdate(
            req.params.id,
            { userId, date, status },
            { new: true, runValidators: true }
        );
        if (!updatedRecord) return res.status(404).json({ error: 'Record not found' });
        res.json(updatedRecord);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Удаление записи
exports.deleteAttendance = async (req, res) => {
    try {
        const deletedRecord = await Attendance.findByIdAndDelete(req.params.id);
        if (!deletedRecord) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Record deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};