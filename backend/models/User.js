// Importiamo mongoose, che è la libreria (ODM) per comunicare con il database MongoDB
const mongoose = require('mongoose');

// Importiamo bcryptjs, una libreria essenziale per criptare le password (hashing)
const bcrypt = require('bcryptjs');

// 1. DEFINIZIONE DELLO SCHEMA (REGISTER)
// Creiamo lo "stampino" per l'utente
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
    }
}, {
    // timestamps aggiunge automaticamente due campi al database: createdAt (data creazione) e updatedAt (data ultima modifica)
    timestamps: true
});


// 2. MIDDLEWARE DI MONGOOSE (SICUREZZA)
// Questo blocco di codice scatta in automatico prima (pre) che l'utente venga salvato (save) nel database
// Serve a non salvare mai la password "in chiaro". In Mongoose 9 con async non serve usare la funzione 'next()'
userSchema.pre('save', async function() {
    // 'this' rappresenta il documento dell'utente che stiamo per salvare.
    // Se la password non è stata modificata (es. se l'utente sta solo cambiando il proprio nome), passiamo oltre con 'return'.
    if (!this.isModified('password')) return;

    // Generiamo "salt", un valore casuale che rende la crittografia ancora più sicura e imprevedibile
    const salt = await bcrypt.genSalt(10);
    // Sovrascriviamo la password in chiaro con quella criptata
    this.password = await bcrypt.hash(this.password, salt);
});


// 3. METODO DI ISTANZA (LOGIN)
// Creiamo una funzione personalizzata che useremo nel Controller durante il Login
// Prende la password inserita dall'utente (candidatePassword) e la confronta con quella criptata nel database
userSchema.methods.comparePassword = async function(candidatePassword) {
    // bcrypt.compare() capisce se la password in chiaro corrisponde all'hash senza doverla decriptare restituendo true o false
    return await bcrypt.compare(candidatePassword, this.password);
};

// Esportiamo il modello compilato chiamandolo 'User' pronto per essere usato nel resto
module.exports = mongoose.model('User', userSchema);