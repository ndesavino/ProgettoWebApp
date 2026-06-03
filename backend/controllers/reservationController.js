// Importiamo il modello Reservation per interagire con le prenotazioni nel database
const Reservation = require('../models/Reservation');

// 1. CREA UNA NUOVA PRENOTAZIONE
// Questa funzione salva un nuovo tavolo
// Sarà protetta dal middleware "auth.js"
exports.createReservation = async (req, res) => {
    try {
        // Estraiamo data, ora e numero di persone inviati dal frontend
        const { date, time, numberOfPeople } = req.body;

        // Creiamo la nuova prenotazione
        // req.user.id esiste grazie al nostro middleware auth.js che lo ha estratto dal token
        const newReservation = new Reservation({
            user: req.user.id, // Colleghiamo la prenotazione a chi ha fatto la richiesta
            date,
            time,
            numberOfPeople
        });

        // Salviamo la prenotazione nel database
        await newReservation.save();

        // Essendo una creazione, usiamo il codice HTTP 201 (Created)
        res.status(201).json({
            message: 'Prenotazione confermata con successo',
            reservation: newReservation
        });
    } catch (error) {
        // Se l'orario è sbagliato o le persone sono > 20, Mongoose lancerà un errore di validazione (codice HTTP 400)
        res.status(400).json({ message: 'Errore nella creazione della prenotazione', error: error.message });
    }
};

// 2. VISUALIZZA LE TUE PRENOTAZIONI
// Questa funzione permette a un utente di vedere solo le sue prenotazioni
exports.getUserReservations = async (req, res) => {
    try {
        // Cerchiamo nel db tutte le prenotazioni in cui il campo "user" coincide con l'id estratto dal token
        // Usiamo sort({ date: 1 }) per ordinarle cronologicamente (dalla più vicina alla più lontana)
        const reservations = await Reservation.find({ user: req.user.id }).sort({ date: 1 });

        // Rispondiamo con codice HTTP 200 (OK) e inviamo l'array delle prenotazioni trovate
        res.status(200).json(reservations);
    } catch (error) {
        // Se c'è un errore imprevisto, rispondiamo con errore HTTP 500 (Internal Server Error)
        res.status(500).json({ message: 'Errore nel recupero delle prenotazioni', error: error.message });
    }
};

// 3. CANCELLA UNA PRENOTAZIONE
// Elimina una prenotazione specifica tramite il suo id
exports.deleteReservation = async (req, res) => {
    try {
        // req.params.id rappresenta l'id della prenotazione passato nell'URL (es. /api/reservations/123)
        const reservationId = req.params.id;

        // Cerchiamo la prenotazione e ci assicuriamo che appartenga all'utente che sta facendo la richiesta
        const reservation = await Reservation.findOneAndDelete({
            _id: reservationId,
            user: req.user.id
        });

        // Se non troviamo la prenotazione, o non è di questo utente, restituiamo il codice HTTP 404 (Not Found)
        if (!reservation) {
            return res.status(404).json({ message: 'Prenotazione non trovata o non autorizzata.' });
        }

        // Il codice HTTP 204 (No Content) per le eliminazioni
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Errore durante la cancellazione.', error: error.message });
    }
};