const User = require('../models/User'); // Assicurati che il tuo modello utente si chiami così
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Funzione di supporto per generare il token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Il token scade dopo 30 giorni
    });
};

// --- LOGICA DI REGISTRAZIONE ---
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Verifica se l'utente esiste già
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Utente già registrato' });
        }

        // Cripta la password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crea l'utente nel DB
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        if (user) {
            res.status(201).json({
                success: true,
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore del server', error: error.message });
    }
};

// --- LOGICA DI LOGIN ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cerca l'utente per email
        const user = await User.findOne({ email });

        // Verifica che l'utente esista e che la password corrisponda
        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({
                success: true,
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id) // Questo è il token che il frontend dovrà salvare
            });
        } else {
            res.status(401).json({ success: false, message: 'Credenziali non valide' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Errore del server', error: error.message });
    }
};