// Importiamo il modello Reservation per interagire con le prenotazioni nel database
const Reservation = require('../models/Reservation');

// Capienza massima consentita per ciascun turno orario
const MAX_CAPACITY = 50;

// Helper per calcolare l'inizio e la fine della giornata (evita problemi di fuso orario con MongoDB)
const getDayRange = (dateStr) => {
    const dateOnly = typeof dateStr === 'string' ? dateStr.split('T')[0] : new Date(dateStr).toISOString().split('T')[0];
    const startOfDay = new Date(`${dateOnly}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateOnly}T23:59:59.999Z`);
    return { dateOnly, startOfDay, endOfDay };
};

// 1. POST (CREATE)
// Questa funzione crea una nuova prenotazione (protetta dal middleware "auth.js")
exports.createReservation = async (req, res) => {
    try {
        const { date, time, numberOfPeople } = req.body;

        // Validazione numero persone (conversione sicura per evitare concatenazione di stringhe in JS)
        const peopleNum = parseInt(numberOfPeople, 10);
        if (isNaN(peopleNum) || peopleNum < 1 || peopleNum > 20) {
            return res.status(400).json({
                message: 'Il numero di persone deve essere compreso tra 1 e 20.'
            });
        }

        const { dateOnly, startOfDay, endOfDay } = getDayRange(date);

        // Controllo date e orari passati
        const reservationDate = new Date(`${dateOnly}T${time}`);
        const now = new Date();
        if (reservationDate < now) {
            return res.status(400).json({
                message: 'Non è possibile effettuare una prenotazione per una data o un orario già trascorso'
            });
        }

        // Controllo overbooking per quella specifica data e quel preciso turno orario
        const existingReservations = await Reservation.find({
            date: { $gte: startOfDay, $lte: endOfDay },
            time,
            status: 'confermata'
        });

        // Sommiamo il numero di persone già prenotate in quel turno
        const currentBookedSeats = existingReservations.reduce((acc, curr) => acc + curr.numberOfPeople, 0);
        if (currentBookedSeats + peopleNum > MAX_CAPACITY) {
            const remaining = Math.max(0, MAX_CAPACITY - currentBookedSeats);
            return res.status(400).json({
                message: `Il turno delle ${time} non è disponibile (posti rimanenti: ${remaining})`
            });
        }

        // Creiamo la nuova prenotazione dopo aver superato tutti i controlli
        const newReservation = new Reservation({
            user: req.user.id, // Estratto dal token JWT dal middleware auth.js
            date: startOfDay,
            time,
            numberOfPeople: peopleNum,
            status: 'confermata'
        });
        await newReservation.save();

        // 🔔 REAL-TIME: Notifichiamo tutti i client connessi via Socket.IO
        const io = req.app.get('socketio');
        if (io) {
            io.emit('notifica-server', `Nuova prenotazione registrata per ${peopleNum} persone in data ${dateOnly} alle ${time}`);
        }

        res.status(201).json({
            message: 'Prenotazione confermata con successo',
            reservation: newReservation
        });
    } catch (error) {
        res.status(400).json({ message: 'Errore nella creazione della prenotazione', error: error.message });
    }
};

// 2. GET (READ)
// Visualizza solo le prenotazioni dell'utente autenticato
exports.getUserReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user.id }).sort({ date: 1, time: 1 });
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero delle prenotazioni', error: error.message });
    }
};

// 3. PUT (UPDATE)
// Modifica una prenotazione esistente (con verifica proprietà, date future e overbooking)
exports.updateReservation = async (req, res) => {
    try {
        const reservationId = req.params.id;
        const { date, time, numberOfPeople } = req.body;

        const peopleNum = parseInt(numberOfPeople, 10);
        if (isNaN(peopleNum) || peopleNum < 1 || peopleNum > 20) {
            return res.status(400).json({
                message: 'Il numero di persone deve essere compreso tra 1 e 20.'
            });
        }

        const { dateOnly, startOfDay, endOfDay } = getDayRange(date);

        // Controllo se la nuova data è nel passato
        const reservationDate = new Date(`${dateOnly}T${time}`);
        const now = new Date();
        if (reservationDate < now) {
            return res.status(400).json({
                message: 'Non puoi spostare la prenotazione a una data o orario già trascorso'
            });
        }

        // Cerchiamo la prenotazione assicurandoci che appartenga all'utente loggato
        const reservation = await Reservation.findOne({ _id: reservationId, user: req.user.id });
        if (!reservation) {
            return res.status(404).json({ message: 'Prenotazione non trovata o non autorizzata' });
        }

        // Controllo overbooking per il nuovo turno prescelto
        const allReservationsForTurn = await Reservation.find({
            date: { $gte: startOfDay, $lte: endOfDay },
            time,
            status: 'confermata'
        });

        // Escludiamo la prenotazione in corso di modifica dal conteggio dei posti
        const otherReservations = allReservationsForTurn.filter(
            (item) => item._id.toString() !== reservationId
        );
        const currentBookedSeats = otherReservations.reduce((acc, curr) => acc + curr.numberOfPeople, 0);

        if (currentBookedSeats + peopleNum > MAX_CAPACITY) {
            const remaining = Math.max(0, MAX_CAPACITY - currentBookedSeats);
            return res.status(400).json({
                message: `Il turno delle ${time} non ha abbastanza posti liberi (rimasti: ${remaining})`
            });
        }

        // Aggiorniamo e salviamo la prenotazione
        reservation.date = startOfDay;
        reservation.time = time;
        reservation.numberOfPeople = peopleNum;
        await reservation.save();

        // 🔔 REAL-TIME: Notifica live modifica
        const io = req.app.get('socketio');
        if (io) {
            io.emit('notifica-server', `Una prenotazione è stata aggiornata per il turno delle ${time} (${dateOnly})`);
        }

        res.status(200).json({
            message: 'Prenotazione aggiornata con successo',
            reservation
        });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante la modifica della prenotazione', error: error.message });
    }
};

// 4. DELETE (DELETE)
// Elimina una prenotazione specifica tramite il suo id
exports.deleteReservation = async (req, res) => {
    try {
        const reservationId = req.params.id;

        const reservation = await Reservation.findOneAndDelete({
            _id: reservationId,
            user: req.user.id
        });

        if (!reservation) {
            return res.status(404).json({ message: 'Prenotazione non trovata o non autorizzata.' });
        }

        // 🔔 REAL-TIME: Notifichiamo che un tavolo è stato liberato
        const io = req.app.get('socketio');
        if (io) {
            io.emit('notifica-server', `Un tavolo si è liberato per il turno delle ${reservation.time}!`);
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Errore durante la cancellazione.', error: error.message });
    }
};
