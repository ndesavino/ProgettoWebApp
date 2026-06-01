const express = require('express');
const router = express.Router();
const { createReservation, getReservations } = require('../controllers/reservationController');
const { protect } = require('../middlewares/auth');

// Entrambe le rotte ora richiedono che il cliente sia loggato (protect)
router.post('/', protect, createReservation);
router.get('/', protect, getReservations);

module.exports = router;