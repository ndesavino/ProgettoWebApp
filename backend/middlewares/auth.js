const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;

    // Verifica se l'header 'Authorization' esiste e inizia con 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Estrae il token (separando la stringa "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Decodifica il token usando la variabile d'ambiente
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Salva l'id dell'utente decodificato nella richiesta per i controller successivi
            req.user = decoded;

            // Passa il controllo al controller effettivo della rotta
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({
                success: false,
                message: 'Non autorizzato, token non valido o scaduto'
            });
        }
    }

    // Se il token non è proprio stato fornito
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Non autorizzato, nessun token fornito'
        });
    }
};

module.exports = { protect };