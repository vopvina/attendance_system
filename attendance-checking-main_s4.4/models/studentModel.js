const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const studentSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, 
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    group: { type: String, required: true },
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

module.exports = mongoose.model('Student', studentSchema);
