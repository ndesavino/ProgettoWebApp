import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Button, TextField, Box, Typography } from '@mui/material';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // Chiamata HTTP POST per creare l'utente
            await api.post('/auth/register', { name, email, password });
            alert("Registrazione completata! Ora puoi fare il login.");
            navigate('/'); // Rimanda al login
        } catch (err) {
            alert(err.response?.data?.message || "Errore di registrazione");
        }
    };

    return (
        <Box sx={{ maxWidth: 400, margin: 'auto', mt: 10 }}>
            <Typography variant="h4" gutterBottom>Registrati al Ristorante</Typography>
            <form onSubmit={handleRegister}>
                <TextField fullWidth label="Nome" margin="normal" value={name} onChange={(e) => setName(e.target.value)} required />
                <TextField fullWidth label="Email" type="email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button fullWidth type="submit" variant="contained" color="secondary" sx={{ mt: 2 }}>
                    Crea Account
                </Button>
            </form>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link to="/">Hai già un account? Accedi</Link>
            </Box>
        </Box>
    );
}