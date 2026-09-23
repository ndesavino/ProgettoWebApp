import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <AppBar position="static" sx={{ mb: 4 }}>
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    La Mia App
                </Typography>
                {/* Operatore ternario: se l'utente c'è mostriamo Logout, altrimenti Login */}
                {user ? (
                    <Button color="inherit" onClick={handleLogout}>Logout</Button>
                ) : (
                    <Button color="inherit" onClick={() => navigate('/')}>Login</Button>
                )}
            </Toolbar>
        </AppBar>
    );
}