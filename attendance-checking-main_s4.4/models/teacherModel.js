const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const teacherSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },  // Указываем тип для _id, но можно не указывать, если не нужно менять его поведение
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    subject: { type: String, required: true },
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
});



module.exports = mongoose.model('Teacher', teacherSchema); // Экспортируем модель
