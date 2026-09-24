import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Typography, Box, Paper, TextField, Button, Grid, Divider } from '@mui/material';

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const [reservations, setReservations] = useState([]);
    
    // Campi per la nuova prenotazione
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [people, setPeople] = useState(2);

    // Effettua la GET al caricamento della pagina
    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            // Nota l'URL RESTful /reservations. Il backend usa il Token per capire chi è l'utente
            const response = await api.get('/reservations');
            setReservations(response.data);
        } catch (error) {
            console.error("Errore nel recuperare le prenotazioni");
        }
    };

    const handleBookTable = async (e) => {
        e.preventDefault();
        try {
            // POST per creare una prenotazione (REST API)
            await api.post('/reservations', {
                date: date,
                time: time,
                numberOfPeople: people
            });
            alert("Tavolo prenotato con successo!");
            fetchReservations(); // Ricarica la lista per mostrare l'aggiornamento
        } catch (error) {
            alert("Errore nella prenotazione");
        }
    };
    
    const handleDelete = async (id) => {
    if (window.confirm("Sei sicuro di voler disdire questa prenotazione?")) {
        try {
            await api.delete(`/reservations/${id}`);
            alert("Prenotazione cancellata!");
            fetchReservations(); // Ricarica la lista per farla sparire
        } catch (error) {
            alert("Errore durante la disdetta");
        }
    }
};

    return (
        <Box sx={{ p: 3, maxWidth: 800, margin: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                Benvenuto, {user?.name || "Ospite"}!
            </Typography>

            {/* FORM DI PRENOTAZIONE */}
            <Paper key={res._id} sx={{ p: 2, mb: 2, borderLeft: '5px solid #1976d2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box>
        <Typography variant="body1">
            📅 Data: <strong>{new Date(res.date).toLocaleDateString()}</strong> alle <strong>{res.time}</strong>
        </Typography>
        <Typography variant="body2" color="textSecondary">
            👥 Persone: {res.numberOfPeople}
        </Typography>
    </Box>
    <Button variant="outlined" color="error" onClick={() => handleDelete(res._id)}>
        Disdici
    </Button>
</Paper>

            <Divider sx={{ my: 3 }} />

            {/* LISTA PRENOTAZIONI EFFETTUATE */}
            <Typography variant="h5" gutterBottom>Le tue Prenotazioni</Typography>
            {reservations.length === 0 ? (
                <Typography color="textSecondary">Non hai ancora prenotato alcun tavolo.</Typography>
            ) : (
                reservations.map((res) => (
                    <Paper key={res._id} sx={{ p: 2, mb: 2, borderLeft: '5px solid #1976d2' }}>
                        <Typography variant="body1">
                            📅 Data: <strong>{new Date(res.date).toLocaleDateString()}</strong> alle <strong>{res.time}</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            👥 Persone: {res.numberOfPeople}
                        </Typography>
                    </Paper>
                ))
            )}
        </Box>
    );
}