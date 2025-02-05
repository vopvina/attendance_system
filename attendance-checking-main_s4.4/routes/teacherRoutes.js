const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

router.get('/', teacherController.getAllTeachers);
router.post('/', teacherController.createTeacher);
router.get('/:id', teacherController.getTeacherById);
router.get('/:id/students', teacherController.getStudentsByTeacher);

module.exports = router;


