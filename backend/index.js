// Importiamo le librerie fondamentali
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importiamo dotenv per leggere le variabili d'ambiente (il file .env)
require('dotenv').config();

// Importiamo i nostri file di rotte
const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

// IMPORTAZIONI SWAGGER
// Importiamo l'interfaccia grafica direttamente dal pacchetto npm
const swaggerUi = require('swagger-ui-express');
// Importiamo le specifiche che abbiamo appena generato nel file swagger.js
const swaggerSpec = require('./swagger');

// Inizializziamo l'applicazione Express
const app = express();

// MIDDLEWARE GLOBALI
// cors() permette al frontend React (che girerà su una porta diversa) di fare richieste a questo backend senza essere bloccato dal browser
app.use(cors());
// express.json() intercetta tutte le richieste in arrivo ed estrae i dati in formato JSON per renderli disponibili in req.body
app.use(express.json());

// CONNESSIONE AL DATABASE MONGODB
// Usiamo la stringa di connessione salvata nel file .env (MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connesso a MongoDB!'))
    .catch((err) => console.error('Errore di connessione a MongoDB:', err));

// MONTAGGIO DI SWAGGER SULLA ROTTA /api-docs
// Diciamo ad Express di mostrare l'interfaccia interattiva di Swagger,
// quando qualcuno va su http://localhost:3000/api-docs
// swaggerUi.serve prepara i file statici grafici,
// swaggerUi.setup(swaggerSpec) inietta i dati della nostra API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// AGGANCIO DELLE ROTTE DELLE NOSTRE API
// Diciamo ad Express di passare tutte le richieste HTTP, che iniziano per /api/auth, al router authRoutes.js"
app.use('/api/auth', authRoutes);
// Diciamo ad Express di passare tutte le richieste HTTP, che iniziano per /api/reservations, al router reservationRoutes.js"
app.use('/api/reservations', reservationRoutes);

// AVVIO DEL SERVER
const PORT = process.env.PORT || 3000; // Leggiamo la porta dal file .env o usiamo la 3000 come predefinita
app.listen(PORT, () => {
    console.log(`Server del in ascolto sulla porta ${PORT}`);
    console.log(`Documentazione API disponibile su: http://localhost:3000/api-docs`);
});