const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Il nome è obbligatorio']
    },
    email: {
        type: String,
        required: [true, 'L\'email è obbligatoria'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'La password è obbligatoria']
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);