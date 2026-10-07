// Importiamo mongoose, la libreria (ODM) per comunicare con il database MongoDB
const mongoose = require('mongoose');

// Definizione dello schema per salvare le prenotazioni
const reservationSchema = new mongoose.Schema({
    // Il campo "user" crea la relazione (FK) tra la prenotazione e l'utente che l'ha fatta
    user: {
        // Salviamo l'id univoco assegnato automaticamente da MongoDB (ObjectId)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Foreign Key ("models/User.js")
        required: true
    },
    date: {
        type: Date, // Usiamo l'oggetto Date nativo di JavaScript
        required: [true, 'La data della prenotazione è obbligatoria.']
    },
    time: {
        type: String,
        required: [true, 'L\'orario è obbligatorio'],
        enum: {
            values: ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'],
            message: 'Orario non valido. Scegli uno dei turni disponibili.'
        }
    },
    numberOfPeople: {
        type: Number,
        required: [true, 'Il numero di persone è obbligatorio.'],
        // Il sistema non accetta prenotazioni per 0 persone o superiori a 20
        min: [1, 'La prenotazione deve essere per almeno 1 persona.'],
        max: [20, 'Massimo 20 persone per singola prenotazione.']
    },
    status: {
        type: String,
        enum: ['confermata', 'cancellata'],
        default: 'confermata'
    }
}, {
    // timestamps aggiunge automaticamente due campi al database: createdAt (data creazione) e updatedAt (data ultima modifica)
    timestamps: true
});

// Esportiamo il modello compilato 'Reservation' pronto per essere usato
module.exports = mongoose.model('Reservation', reservationSchema);