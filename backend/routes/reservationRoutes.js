// Importiamo il framework Express
const express = require('express');

// Creiamo il router per le prenotazioni
const router = express.Router();

// Importiamo il controller delle prenotazioni reservationController.js
const reservationController = require('../controllers/reservationController');

// Importiamo il nostro middleware di autenticazione auth.js
const auth = require('../middlewares/auth');

// APPLICHIAMO IL MIDDLEWARE (SICUREZZA)
// Passando "auth" in mezzo alla rotta,
// ci assicuriamo che Express controlli il Token JWT prima di lanciare il controller
// Se il token manca o è falso, la richiesta viene respinta subito.

// 1. ROTTA PER CREARE UNA PRENOTAZIONE (Method: POST)
router.post('/', auth, reservationController.createReservation);

// 2. ROTTA PER LEGGERE LE PRENOTAZIONI DELL'UTENTE (Method: GET)
router.get('/', auth, reservationController.getUserReservations);

// 3. ROTTA PER CANCELLARE UNA PRENOTAZIONE (Method: DELETE)
// :id è un parametro dinamico (significa che l'URL sarà qualcosa come /api/reservations/12345)
router.delete('/:id', auth, reservationController.deleteReservation);

// Esportiamo il router per poterlo agganciare nel file principale (index.js)
module.exports = router;