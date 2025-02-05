const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');

exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createTeacher = async (req, res) => {
    try {
        const teacher = new Teacher(req.body);
        await teacher.save();
        res.status(201).json(teacher);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id).populate('students');
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getStudentsByTeacher = async (req, res) => {
    try {
        const teacherId = req.params.id;

        // Находим преподавателя по ID
        const teacher = await Teacher.findOne({ id: teacherId }).populate('students');

        if (!teacher) {
            return res.status(404).json({ error: 'Преподаватель не найден' });
        }

        // Возвращаем студентов преподавателя
        res.status(200).json({ students: teacher.students });
    } catch (error) {
        console.error('Ошибка получения студентов:', error);
        res.status(500).json({ error: 'Ошибка сервера. Попробуйте позже.' });
    }
};
