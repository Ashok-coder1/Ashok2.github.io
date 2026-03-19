

const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
    fullName: String,
    mobile: String,
    email: String,
    subject: String,
    message: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Form', formSchema);