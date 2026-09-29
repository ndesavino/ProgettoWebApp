import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <AppBar position="sticky" sx={{ mb: 4, boxShadow: 3 }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <RestaurantMenuIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: 'secondary.main' }} />
                    <Typography 
                        variant="h5" 
                        sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 2, fontFamily: 'serif' }}
                    >
                        LA PERGOLA
                    </Typography>

                    {user ? (
                        <>
                            <Typography variant="body1" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                                Ciao, {user.name}
                            </Typography>
                            <Button variant="outlined" color="secondary" onClick={handleLogout} sx={{ fontWeight: 'bold' }}>
                                Esci
                            </Button>
                        </>
                    ) : (
                        <Button variant="contained" color="secondary" onClick={() => navigate('/')} sx={{ fontWeight: 'bold', color: 'black' }}>
                            Accedi
                        </Button>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
}