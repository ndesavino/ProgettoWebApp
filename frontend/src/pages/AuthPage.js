import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthPage() {
    // Stati per i campi del form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // Usato solo per la registrazione

    // Stato per decidere se mostrare il form di Login (true) o Registrazione (false)
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const navigate = useNavigate();

    // Funzione asincrona che gestisce l'invio del Form (Slide 06 - Fetch API)
    const handleSubmit = async (e) => {
        e.preventDefault(); // Blocca il ricaricamento della pagina
        setMessage('');
        setIsError(false);

        // Determina l'endpoint corretto in base allo stato attuale del form
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const url = `http://localhost:3000${endpoint}`;

        // Prepariamo il corpo della richiesta HTTP
        const bodyData = isLogin ? { email, password } : { name, email, password };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });

            const data = await response.json();

            if (response.ok) {
                if (isLogin) {
                    // Se è Login, salviamo il Token JWT nel localStorage (la nostra cassaforte del browser)
                    localStorage.setItem('token', data.token);
                    // Reindirizziamo l'utente alla Dashboard delle prenotazioni
                    navigate('/dashboard');
                } else {
                    // Se è Registrazione, mostriamo un messaggio di successo e passiamo al form di Login
                    setMessage('Registrazione completata con successo! Ora puoi accedere.');
                    setIsLogin(true);
                    setName('');
                }
            } else {
                setIsError(true);
                setMessage(data.message || 'Si è verificato un errore.');
            }
        } catch (err) {
            setIsError(true);
            setMessage('Errore di rete: il server backend è acceso?');
        }
    };

    return (
        <main>
            <h2>{isLogin ? 'Accedi' : 'Registrati'}</h2>

            {/* Messaggio di feedback (Errore o Successo) con stile inline minimale */}
            {message && (
                <p style={{ color: isError ? 'red' : 'green', fontWeight: 'bold' }}>
                    {message}
                </p>
            )}

            <form onSubmit={handleSubmit}>
                {/* Mostra il campo Nome solo se NON siamo in modalità Login */}
                {!isLogin && (
                    <div>
                        <label>Nome: </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <br /><br />
                    </div>
                )}

                <div>
                    <label>Email: </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <br />
                <div>
                    <label>Password: </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <br />
                <button type="submit">{isLogin ? 'Entra' : 'Invia Registrazione'}</button>
            </form>

            <br />
            {/* Pulsante per switchare tra Login e Registrazione senza cambiare URL */}
            <button onClick={() => { setIsLogin(!isLogin); setMessage(''); }}>
                {isLogin ? 'Non hai un account? Registrati qui' : 'Hai già un account? Accedi qui'}
            </button>
        </main>
    );
}

export default AuthPage;