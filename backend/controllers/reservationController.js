const Reservation = require('../models/Reservation');
const CAPIENZA_MASSIMA = 50;

exports.createReservation = async (req, res) => {
    try {
        const { name, email, phone, date, timeSlot, numberOfGuests, notes } = req.body;

        const searchDate = new Date(date);
        const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

        const existingReservations = await Reservation.find({
            date: { $gte: startOfDay, $lte: endOfDay },
            timeSlot: timeSlot,
            status: 'confirmed'
        });

        const ospitiAttuali = existingReservations.reduce((totale, res) => totale + res.numberOfGuests, 0);

        if (ospitiAttuali + Number(numberOfGuests) > CAPIENZA_MASSIMA) {
            return res.status(400).json({
                success: false,
                message: `Posti insufficienti per questo turno. Posti rimasti: ${CAPIENZA_MASSIMA - ospitiAttuali}`
            });
        }

        // Creazione prenotazione associata all'ID dell'utente loggato (req.user.id)
        const newReservation = new Reservation({
            user: req.user.id, // Collegamento all'account del cliente
            name,
            email,
            phone,
            date: startOfDay,
            timeSlot,
            numberOfGuests,
            notes
        });

        await newReservation.save();

        res.status(201).json({
            success: true,
            message: 'Prenotazione registrata con successo',
            data: newReservation
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore interno', error: error.message });
    }
};

// Modificato: Restituisce SOLO le prenotazioni dell'utente che fa la richiesta
exports.getReservations = async (req, res) => {
    try {
        // Cerca solo i documenti dove il campo 'user' corrisponde all'ID del token
        const reservations = await Reservation.find({ user: req.user.id }).sort({ date: 1, timeSlot: 1 });

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore nel recupero', error: error.message });
    }
};