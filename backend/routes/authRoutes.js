// Importiamo il framework Express
const express = require('express');

// Creiamo un router, ovvero un mini-gestore di rotte isolato
const router = express.Router();

// Importiamo il nostro controller di autenticazione authController.js che contiene la vera logica
const authController = require('../controllers/authController');

// 1. ROTTA DI REGISTRAZIONE (Method: POST)
// Quando il frontend fa una richiesta POST all'indirizzo /register, eseguiamo la funzione register
router.post('/register', authController.register);

// 2. ROTTA DI LOGIN (Method: POST)
// Quando il frontend fa una richiesta POST all'indirizzo /login, eseguiamo la funzione login
router.post('/login', authController.login);

// Esportiamo il router per poterlo agganciare nel file principale (index.js)
module.exports = router;