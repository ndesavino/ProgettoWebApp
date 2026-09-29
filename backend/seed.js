// Il seeding è una funzione che serve a popolare il db
// MongoDB con dati iniziali per utenti e prenotazioni

// Importiamo la libreria Mongoose per connetterci al database ed eseguire operazioni
const mongoose = require('mongoose');

// Importiamo dotenv per caricare le variabili d'ambiente dal file .env
// (contiene la stringa di connessione del database)
require('dotenv').config();

// Importiamo i modelli Mongoose per utenti e prenotazioni per interagire con le rispettive collezioni nel db
const User = require('./models/User');
const Reservation = require('./models/Reservation');

// Funzione asincrona per eseguire le operazioni di seeding: prima si connette al database,
// cancella i dati esistenti, poi crea nuovi utenti e prenotazioni e infine chiude la connessione
async function seed() {
    try {
        // Ci connettiamo al database MongoDB usando la stringa di connessione salvata in .env
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB!');

        // Cancelliamo i dati esistenti dalle collezioni User e Reservation
        // per assicurarci di partire da un database pulito prima di inserire i nuovi dati
        await User.deleteMany({});
        await Reservation.deleteMany({});
        console.log('Cleared existing data!');

        // Creiamo un utente di prova (sample user) specificando nome, email e password
        const sample_user = await User.create({
            name: "Mario Rossi",
            email: "mario.rossi@email.com",
            password: "password123"
        });

        console.log('Created user:', sample_user.name);

        // Definiamo un array di oggetti "prenotazione" con vari attributi come data, orario e numero di persone
        // Ogni prenotazione è collegata all'utente appena creato tramite il suo id (sample_user._id)
        const reservations = [
            {
                user: sample_user._id,
                date: new Date("2026-06-15"),
                time: "20:30",
                numberOfPeople: 4,
                status: "confermata"
            },
            {
                user: sample_user._id,
                date: new Date("2026-06-20"),
                time: "13:00",
                numberOfPeople: 2,
                status: "confermata"
            },
            {
                user: sample_user._id,
                date: new Date("2026-07-01"),
                time: "21:00",
                numberOfPeople: 10,
                status: "confermata"
            }
        ];

        // Inseriamo le prenotazioni definite nella collezione Reservation del db
        // e stampiamo nel terminale il numero di prenotazioni create
        const createdReservations = await Reservation.insertMany(reservations);
        console.log(`Created ${createdReservations.length} reservations`);

        console.log('Database seeding completed successfully!');

        // Chiudiamo la connessione al database dopo che il seeding è completo per liberare le risorse
        await mongoose.connection.close();

    } catch (error) {
        // In caso di errore, lo stampiamo nel terminale e forziamo la chiusura dello script
        console.error("Seed error:", error.message);
        process.exit(1);
    }
}

// Eseguiamo la funzione
seed();