// Importiamo le librerie fondamentali
const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Importiamo dotenv puntando in modo assoluto al file .env della cartella backend
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Importiamo i nostri file di rotte
const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

// IMPORTAZIONI SWAGGER
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// Inizializziamo l'applicazione Express
const app = express();
const server = http.createServer(app);

// Configurazione Socket.IO 
const io = new Server(server, {
    cors: { origin: '*' }
});
app.set('socketio', io); // Salviamo l'istanza di Socket.IO dentro Express così i controller possono usarla

io.on('connection', (socket) => {
    console.log(`Utente connesso (Socket ID: ${socket.id})`);
    socket.emit('notifica-server', 'Ciao dal server backend! Connessione live stabilita.');
    socket.on('disconnect', () => {
        console.log(`Utente disconnesso`);
    });
});

// MIDDLEWARE GLOBALI
app.use(cors());
app.use(express.json());

// CONNESSIONE AL DATABASE MONGODB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connesso a MongoDB!'))
    .catch((err) => console.error('Errore di connessione a MongoDB:', err));

// MONTAGGIO DI SWAGGER SULLA ROTTA /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// AGGANCIO DELLE ROTTE DELLE NOSTRE API
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);

// AVVIO DEL SERVER
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server Express e Socket.IO in ascolto sulla porta ${PORT}`);
});
