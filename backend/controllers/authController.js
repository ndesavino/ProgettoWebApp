// Importiamo il modello User per poter interagire con la collezione degli utenti nel database
const User = require('../models/User');

// Importiamo jsonwebtoken per generare la "chiave" (token) da dare all'utente dopo il login
const jwt = require('jsonwebtoken');

// 1. REGISTER
exports.register = async (req, res) => {
    try {
        // Estraiamo i dati inviati dal frontend che si trovano nel "corpo" (body) della richiesta
        const { name, email, password } = req.body;

        // Controlliamo se nel database esiste già un utente con questa email
        const existingUser = await User.findOne({ email });

        // Se l'utente esiste già, fermiamo tutto e rispondiamo con errore HTTP 400 (Bad Request)
        if (existingUser) {
            return res.status(400).json({ message: 'Un utente con questa email esiste già' });
        }

        // Creiamo una nuova istanza (documento) dell'utente con i dati ricevuti
        const newUser = new User({
            name,
            email,
            // La password in chiaro verrà criptata automaticamente dal nostro "pre-save" nel modello User
            password
        });

        // Salviamo fisicamente il nuovo utente nel database MongoDB
        await newUser.save();

        // Rispondiamo al frontend con il codice HTTP 201 (Created)
        res.status(201).json({ message: 'Utente registrato con successo' });
    } catch (error) {
        // Se c'è un errore imprevisto, rispondiamo con errore HTTP 500 (Internal Server Error)
        res.status(500).json({ message: 'Errore durante la registrazione', error: error.message });
    }
};

// 2. LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cerchiamo l'utente nel database tramite la sua email
        const user = await User.findOne({ email });

        // Se l'utente non viene trovato, diamo errore HTTP 401 (Unauthorized)
        if (!user) {
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        // Usiamo il metodo "comparePassword" (che abbiamo creato nel modello User) per verificare la password
        const isMatch = await user.comparePassword(password);

        // Se la password è sbagliata, diamo di nuovo errore HTTP 401, non dicendo se è sbagliata l'email o la password per sicurezza
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        // Se tutto è corretto, generiamo il Token JWT
        // Nel contenuto del token salviamo l'id univoco dell'utente
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Il token scadrà automaticamente dopo un giorno
        );

        // Rispondiamo con codice HTTP 200 (OK) e inviamo il token al frontend
        res.status(200).json({ message: 'Login effettuato con successo', token });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante il login', error: error.message });
    }
};