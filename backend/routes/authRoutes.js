const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Rotta per creare un nuovo gestore: POST /api/auth/register
router.post('/register', register);

// Rotta per accedere: POST /api/auth/login
router.post('/login', login);

module.exports = router;