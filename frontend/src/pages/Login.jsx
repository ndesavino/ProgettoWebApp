import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button, TextField, Box, Typography, Paper } from '@mui/material';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard'); 
        } catch (err) {
            alert("Credenziali errate!");
        }
    };

    return (
        <Box sx={{ maxWidth: 450, margin: 'auto', mt: { xs: 5, md: 12 }, p: 2 }}>
            <Paper sx={{ p: 5, borderRadius: 4, bgcolor: '#ffffff', boxShadow: 12, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Bentornato
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Accedi per gestire le tue prenotazioni
                </Typography>
                
                <form onSubmit={handleSubmit}>
                    <TextField 
                        fullWidth label="Email" margin="normal" variant="outlined"
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
                        Entra
                    </Button>
                </form>
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        Non hai un account? <Link to="/register" style={{ color: '#800020', fontWeight: 'bold', textDecoration: 'none' }}>Registrati qui</Link>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}