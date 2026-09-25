import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Button, TextField, Box, Typography, Paper } from '@mui/material';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { name, email, password });
            alert("Registrazione completata! Ora puoi fare il login.");
            navigate('/'); 
        } catch (err) {
            alert(err.response?.data?.message || "Errore di registrazione");
        }
    };

    return (
        <Box sx={{ maxWidth: 450, margin: 'auto', mt: { xs: 5, md: 8 }, p: 2 }}>
            <Paper sx={{ p: 5, borderRadius: 4, bgcolor: '#ffffff', boxShadow: 12, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Nuovo Ospite
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Crea un account per prenotare il tuo tavolo
                </Typography>
                
                <form onSubmit={handleRegister}>
                    <TextField 
                        fullWidth label="Nome Completo" margin="normal" variant="outlined" 
                        value={name} onChange={(e) => setName(e.target.value)} required 
                    />
                    <TextField 
                        fullWidth label="Email" type="email" margin="normal" variant="outlined" 
                        value={email} onChange={(e) => setEmail(e.target.value)} required 
                    />
                    <TextField 
                        fullWidth label="Password" type="password" margin="normal" variant="outlined" 
                        value={password} onChange={(e) => setPassword(e.target.value)} required 
                    />
                    <Button 
                        fullWidth type="submit" variant="contained" color="secondary" size="large"
                        sx={{ mt: 3, mb: 2, fontWeight: 'bold', color: '#000' }}
                    >
                        Crea Account
                    </Button>
                </form>
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        Hai già un account? <Link to="/" style={{ color: '#800020', fontWeight: 'bold', textDecoration: 'none' }}>Accedi</Link>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}