// Importiamo il framework Express
const express = require('express');

// Inizializzazione del router di Express
const router = express.Router();

// Importiamo il controller delle prenotazioni "reservationController.js"
const reservationController = require('../controllers/reservationController');

// Importiamo il nostro middleware di autenticazione "auth.js"
const auth = require('../middlewares/auth');

// Applichiamo il middleware, ci assicuriamo che Express
// controlli il Token JWT prima di lanciare il controller
// Se il token manca o è falso, la richiesta viene respinta subito

// 1. ROTTA PER CREARE UNA PRENOTAZIONE (Method: POST)
router.post('/', auth, reservationController.createReservation);

// 2. ROTTA PER LEGGERE LE PRENOTAZIONI DELL'UTENTE (Method: GET)
router.get('/', auth, reservationController.getUserReservations);

// 3. ROTTA PER MODIFICARE UNA PRENOTAZIONE (Method: PUT)
router.put('/:id', auth, reservationController.updateReservation);

// 4. ROTTA PER CANCELLARE UNA PRENOTAZIONE (Method: DELETE)
router.delete('/:id', auth, reservationController.deleteReservation);

// :id è un parametro dinamico quindi l'URL sarà qualcosa come "/api/reservations/64b5f..."

// Esportiamo il router per poterlo agganciare in "index.js"
module.exports = router;