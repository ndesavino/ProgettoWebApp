// Importiamo mongoose, che è la libreria (ODM) per comunicare con il database MongoDB
const mongoose = require('mongoose');

// Importiamo bcryptjs, una libreria essenziale per criptare le password (hashing)
const bcrypt = require('bcryptjs');

// 1. REGISTER
// Definiamo lo schema Mongoose e delle relative regole di validazione
// Nessun utente potrà essere salvato se non rispetta rigorosamente queste regole
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        // Se il nome manca, Mongoose bloccherà il salvataggio e restituirà questo messaggio d'errore
        required: [true, 'Il nome è obbligatorio'],
        // trim rimuove in automatico gli spazi vuoti all'inizio e alla fine del nome
        trim: true
    },
    email: {
        type: String,
        required: [true, 'L\'email è obbligatoria'],
        unique: true, // Impedisce che due utenti si registrino con la stessa email
        lowercase: true, // Converte l'email tutta in minuscolo per evitare doppioni accidentali
        // match usa un'espressione Regolare (Regex) per verificare che l'email sia scritta nel formato corretto (es. nome@dominio.it)
        match: [/^\S+@\S+\.\S+$/, 'Usa un indirizzo email valido']
    },
    password: {
        type: String,
        required: [true, 'La password è obbligatoria'],
        minlength: [6, 'La password deve avere almeno 6 caratteri'] // Validazione di sicurezza base
    },
    role: {
        type: String,
        enum: ['client', 'admin'],
        // Se non specifichiamo nulla durante la registrazione, diventa 'user' di default
        default: 'client'
    }
}, {
    // timestamps aggiunge automaticamente due campi al database: createdAt (data creazione) e updatedAt (data ultima modifica)
    timestamps: true
});

// 2. MIDDLEWARE DI MONGOOSE
// Middleware pre-save (richiamato in automatico prima che l'utente venga salvato)
// per eseguire l'hashing della password prima della persistenza nel database
// Previene il salvataggio delle credenziali non criptate
userSchema.pre('save', async function() {
    // Applica l'hashing solo se il campo password è stato effettivamente modificato
    if (!this.isModified('password')) return;
    // Generazione del salt crittografico (10 rounds) per la sicurezza dell'hash
    const salt = await bcrypt.genSalt(10);
    // Sostituzione della password non criptata con l'hash generato
    this.password = await bcrypt.hash(this.password, salt);
});

// 3. LOGIN
// Creiamo un metodo di istanza che useremo nel controller durante il login
// Prende la password inserita dall'utente (candidatePassword) e la confronta con quella criptata nel database
userSchema.methods.comparePassword = async function(candidatePassword) {
    // bcrypt.compare() capisce se la password in chiaro corrisponde all'hash senza doverla decriptare restituendo true o false
    return await bcrypt.compare(candidatePassword, this.password);
};

// Esportiamo il modello compilato chiamandolo 'User' pronto per essere usato nel resto
module.exports = mongoose.model('User', userSchema);