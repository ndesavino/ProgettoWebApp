const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    // Aggiungiamo il riferimento all'utente registrato
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Il nome del cliente è obbligatorio'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'L\'email è obbligatoria'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Il numero di telefono è obbligatorio'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'La data della prenotazione è obbligatoria']
    },
    timeSlot: {
        type: String,
        required: [true, 'La fascia oraria è obbligatoria'],
        enum: ['12:30', '13:30', '20:00', '21:30']
    },
    numberOfGuests: {
        type: Number,
        required: [true, 'Il numero di ospiti è obbligatorio'],
        min: [1, 'La prenotazione deve essere per almeno 1 persona'],
        max: [10, 'Per prenotazioni superiori a 10 persone contattare la struttura']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'confirmed'
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Reservation', reservationSchema);