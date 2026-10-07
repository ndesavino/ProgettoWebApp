// Importiamo il modello Reservation per interagire con le prenotazioni nel database
const Reservation = require('../models/Reservation');

// 1. POST (CREATE)
// Questa funzione crea una nuova prenotazione (protetta dal middleware "auth.js")
exports.createReservation = async (req, res) => {
    try {
        // Estraiamo data, ora e numero di persone inviati dal frontend
        const { date, time, numberOfPeople } = req.body;

        // Controllo date e orari passati
        const reservationDate = new Date(`${date}T${time}`);
        const now = new Date();
        if (reservationDate < now) {
            return res.status(400).json({
                message: 'Non è possibile effettuare una prenotazione per una data o un orario già trascorso'
            });
        }

        // Controllo overbooking
        const MAX_CAPACITY = 50; // Capienza massima di persone consentita per ciascun turno orario
        // Cerchiamo le prenotazioni confermate per quella specifica data e quel preciso turno
        const existingReservations = await Reservation.find({ date, time, status: 'confermata' });
        // Sommiamo il numero di persone già prenotate in quel turno
        const currentBookedSeats = existingReservations.reduce((acc, curr) => acc + curr.numberOfPeople, 0);
        // Se l'aggiunta delle nuove persone supera il limite, blocchiamo la richiesta
        if (currentBookedSeats + numberOfPeople > MAX_CAPACITY) {
            return res.status(400).json({
                message: `Il turno delle ${time} non è disponibile (posti rimanenti: ${MAX_CAPACITY - currentBookedSeats})`
            });
        }

        // Creiamo la nuova prenotazione dopo aver superato i controlli
        const newReservation = new Reservation({
            // Il middleware "auth.js" ha estratto dal token req.user.id
            user: req.user.id, // Colleghiamo la prenotazione a chi ha fatto la richiesta
            date,
            time,
            numberOfPeople
        });
        await newReservation.save(); // Salviamo la prenotazione nel database

        // Recuperiamo Socket.IO globale ed emettiamo l'evento a tutti i client connessi (real-time)
        const io = req.app.get('socketio');
        if (io) {
            io.emit('notifica-server', `Qualcuno ha appena prenotato un tavolo per ${numberOfPeople} persone in data ${date} alle ${time}!`);
        }

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

// 2. GET (READ)
// Questa funzione permette di visualizzare a un utente solo le sue prenotazioni
exports.getUserReservations = async (req, res) => {
    try {
        // Cerchiamo nel db tutte le prenotazioni in cui il campo "user" coincide con l'id estratto dal token
        // Usiamo sort({ date: 1, time: 1 }) per ordinarle cronologicamente dalla più vicina alla più lontana
        const reservations = await Reservation.find({ user: req.user.id }).sort({ date: 1, time: 1 });
        // Rispondiamo con codice HTTP 200 (OK) e inviamo l'array delle prenotazioni trovate
        res.status(200).json(reservations);
    } catch (error) {
        // Se c'è un errore imprevisto, rispondiamo con errore HTTP 500 (Internal Server Error)
        res.status(500).json({ message: 'Errore nel recupero delle prenotazioni', error: error.message });
    }
};

// 3. PUT (UPDATE)
// Questa funzione permette di modificare una prenotazione esistente
exports.updateReservation = async (req, res) => {
    try {
        // req.params.id rappresenta l'id passato nell'URL
        const reservationId = req.params.id;
        const { date, time, numberOfPeople } = req.body;

        // Controllo se la nuova data è nel passato
        const reservationDate = new Date(`${date}T${time}`);
        const now = new Date();
        if (reservationDate < now) {
            return res.status(400).json({
                message: 'Non puoi spostare la prenotazione a una data o orario già trascorso'
            });
        }

        // Cerchiamo la prenotazione e ci assicuriamo che appartenga a questo utente
        // Esattamente la stessa logica che si usa per controllare l'autore di una recensione
        const reservation = await Reservation.findOne({ _id: reservationId, user: req.user.id });
        if (!reservation) {
            return res.status(404).json({ message: 'Prenotazione non trovata o non autorizzata' });
        }

        // Rifacciamo il controllo overbooking per il nuovo turno
        const MAX_CAPACITY = 50;
        // Troviamo tutte le prenotazioni per quella data e orario
        const allReservationsForTurn = await Reservation.find({ date, time, status: 'confermata' });

        // Usiamo un semplice .filter() di JavaScript per escludere dal conteggio la
        // prenotazione che stiamo modificando, altrimenti conteremmo i posti due volte
        const otherReservations = allReservationsForTurn.filter(
            (res) => res._id.toString() !== reservationId
        );

        // Sommiamo i posti delle altre prenotazioni
        const currentBookedSeats = otherReservations.reduce((acc, curr) => acc + curr.numberOfPeople, 0);

        if (currentBookedSeats + numberOfPeople > MAX_CAPACITY) {
            return res.status(400).json({
                message: `Il turno delle ${time} non ha abbastanza posti liberi (rimasti: ${MAX_CAPACITY - currentBookedSeats})`
            });
        }

        // Aggiorniamo i dati della prenotazione sovrascrivendoli
        reservation.date = date;
        reservation.time = time;
        reservation.numberOfPeople = numberOfPeople;

        // Salviamo le modifiche nel database
        await reservation.save();
        res.status(200).json({
            message: 'Prenotazione aggiornata con successo',
            reservation
        });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante la modifica della prenotazione', error: error.message });
    }
};

// 4. DELETE (DELETE)
// Questa funzione elimina una prenotazione specifica tramite il suo id
exports.deleteReservation = async (req, res) => {
    try {
        // req.params.id rappresenta l'id della prenotazione passato nell'URL (/api/reservations/64b5f...)
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

// (CRUD)