const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Carica le variabili dal file .env

// 1. Importazione dei file di routing
const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware globali
app.use(cors());
app.use(express.json()); // Permette di leggere il body in formato JSON (fondamentale per parsare il body delle richieste in JSON)

// Connessione a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    family: 4,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
})
    .then(() => {
        console.log("Connessione al database stabilita con successo");
    })
    .catch((err) => {
        console.error("Dettaglio tecnico errore:");
        console.error("Nome:", err.name);
        console.error("Messaggio:", err.message);
    });

// 2. Montaggio delle rotte
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);

// Rotta di Health Check per testare che il server risponda
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server backend funzionante' });
});

// Avvio del server
app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});