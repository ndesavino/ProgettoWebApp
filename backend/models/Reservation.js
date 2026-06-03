// Importiamo mongoose, che è la libreria (ODM) per comunicare con il database MongoDB
const mongoose = require('mongoose');

// 1. DEFINIZIONE DELLO SCHEMA
// Creiamo lo "stampino" per la prenotazione
// Nessuna prenotazione potrà essere salvata se non rispetta rigorosamente queste regole
const reservationSchema = new mongoose.Schema({
    // Il campo 'user' crea la Relazione (Foreign Key) tra la prenotazione e chi l'ha fatta
    user: {
        // Salviamo l'id univoco assegnato automaticamente da MongoDB (ObjectId)
        type: mongoose.Schema.Types.ObjectId,
        // Diciamo a Mongoose che questo id appartiene alla collezione (tabella) degli 'User'
        ref: 'User',
        required: true
    },
    date: {
        // Usiamo l'oggetto Date nativo di JavaScript per gestire le date in modo corretto
        type: Date,
        required: [true, 'La data della prenotazione è obbligatoria']
    },
    time: {
        type: String,
        required: [true, 'L\'orario è obbligatorio'],
        // match usa un'espressione Regolare (Regex) per accettare solo il formato orario a 24 ore "HH:mm" (es. 19:30, 21:00)
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato orario non valido (usa HH:mm)']
    },
    numberOfPeople: {
        type: Number,
        required: [true, 'Il numero di persone è obbligatorio'],
        // Il sistema non accetta prenotazioni per 0 persone o superiori a 20
        min: [1, 'La prenotazione deve essere per almeno 1 persona'],
        max: [20, 'Massimo 20 persone per singola prenotazione']
    },
    status: {
        type: String,
        // enum limita i valori possibili per questo campo, accettando esclusivamente quelli in questa lista
        enum: ['confermata', 'cancellata'],
        // default fa sì che una nuova prenotazione parta automaticamente come "confermata" senza doverlo specificare
        default: 'confermata'
    }
}, {
    // timestamps aggiunge automaticamente due campi al database: createdAt (data creazione) e updatedAt (data ultima modifica)
    timestamps: true
});

// Esportiamo il modello compilato chiamandolo 'Reservation' pronto per essere usato nel resto
module.exports = mongoose.model('Reservation', reservationSchema);