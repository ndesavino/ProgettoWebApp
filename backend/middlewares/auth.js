// Importiamo jsonwebtoken per verificare e decriptare il token di sicurezza
const jwt = require('jsonwebtoken');

// MIDDLEWARE DI AUTENTICAZIONE
// Questa funzione si interpone tra la richiesta dell'utente e il controller.
// Se l'utente possiede un token valido la richiesta passa, altrimenti viene respinta con errore HTTP 401
const auth = (req, res, next) => {
    // 1. ESTRAZIONE DEL TOKEN
    // Cerca l'header 'Authorization' nella richiesta HTTP in arrivo
    const authHeader = req.header('Authorization');

    // Se l'header manca o non rispetta lo standard (deve iniziare con 'Bearer '),
    // blocchiamo l'accesso con il codice HTTP 401 (Unauthorized)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Accesso negato: token mancante o formato errato' });
    }

    // Estraiamo il token vero e proprio (eliminando 'Bearer ')
    const token = authHeader.replace('Bearer ', '');

    try {
        // 2. VERIFICA DEL TOKEN
        // jwt.verify controlla che il token sia stato firmato con il nostro JWT_SECRET e non sia scaduto
        // Se il token è contraffatto, questa operazione fallisce e salta direttamente al blocco catch
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. INIEZIONE DEI DATI
        // Il token decriptato contiene il payload originale (l'id dell'utente che avevamo inserito al login)
        // Salviamo questi dati nell'oggetto 'req' chiamandolo 'req.user'
        // In questo modo, i controllers successivi sapranno esattamente quale utente ha fatto la richiesta
        req.user = decoded;

        // next() dice ad Express di che il controllo è superato e passare la richiesta alla funzione successiva (il controller)
        next();
    } catch (err) {
        // Se la verifica fallisce (es. token scaduto o manomesso), fermiamo tutto e restituiamo errore HTTP 401
        res.status(401).json({ message: 'Token non valido o scaduto' });
    }
};

// Esportiamo il middleware per poterlo applicare alle rotte che vogliamo proteggere
module.exports = auth;