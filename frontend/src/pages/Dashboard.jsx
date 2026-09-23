import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Typography, Box, Paper } from '@mui/material';

export default function Dashboard() {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // 1. Stabilisce la connessione con il backend all'avvio del componente
        const socket = io('http://localhost:5000');

        // 2. Ascolta l'evento 'notifica-server'
        socket.on('notifica-server', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        // 3. Cleanup: quando l'utente cambia pagina, chiudiamo la connessione
        return () => {
            socket.disconnect();
        };
    }, []); // L'array vuoto fa eseguire questo hook solo al montaggio del componente

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Dashboard</Typography>
            <Typography variant="subtitle1">Qui vedrai i messaggi real-time:</Typography>
            
            <Paper sx={{ p: 2, mt: 2, minHeight: 150 }}>
                {messages.length === 0 ? (
                    <Typography color="textSecondary">In attesa di notifiche...</Typography>
                ) : (
                    messages.map((msg, index) => (
                        <Typography key={index} color="primary">- {msg}</Typography>
                    ))
                )}
            </Paper>
        </Box>
    );
}