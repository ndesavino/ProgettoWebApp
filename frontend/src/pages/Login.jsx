import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Typography } from '@mui/material';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard'); // Redirezione post-login (React Router)
        } catch (err) {
            alert("Credenziali errate!");
        }
    };

    return (
        <Box className="login-container" sx={{ maxWidth: 400, margin: 'auto', mt: 10 }}>
            <Typography variant="h4" gutterBottom>Accedi</Typography>
            <form onSubmit={handleSubmit}>
                <TextField 
                    fullWidth label="Email" margin="normal" 
                    value={email} onChange={(e) => setEmail(e.target.value)} 
                />
                <TextField 
                    fullWidth label="Password" type="password" margin="normal" 
                    value={password} onChange={(e) => setPassword(e.target.value)} 
                />
                <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
                    Entra
                </Button>
            </form>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link to="/register">Non hai un account? Registrati</Link>
            </Box>
        </Box>
    );
}