import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { Typography, Box, Paper, TextField, Button, Grid, Divider, MenuItem } from "@mui/material";
import { io } from "socket.io-client";

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const [reservations, setReservations] = useState([]);
    
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today); // Inizializzato a oggi per evitare l'overlapping della label!
    const [time, setTime] = useState("19:30");
    const [people, setPeople] = useState(2);

    const timeSlots = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"];

    useEffect(() => {
        fetchReservations();

        const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000';
        const socket = io(socketUrl);
        socket.on("notifica-server", (messaggio) => {
            alert("?? NOTIFICA LIVE: " + messaggio);
        });

        return () => socket.disconnect();
    }, []);

    const fetchReservations = async () => {
        try {
            const response = await api.get("/reservations");
            setReservations(response.data);
        } catch (error) {
            console.error("Errore nel recuperare le prenotazioni");
        }
    };

    const handleBookTable = async (e) => {
        e.preventDefault();
        try {
            await api.post("/reservations", { date, time, numberOfPeople: people });
            alert("Tavolo prenotato con successo!");
            fetchReservations();
        } catch (error) {
            alert("Errore nella prenotazione");
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm("Sei sicuro di voler disdire questa prenotazione?")) {
            try {
                await api.delete(`/reservations/${id}`);
                alert("Prenotazione cancellata!");
                fetchReservations();
            } catch (error) {
                alert("Errore durante la disdetta");
            }
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 900, margin: "auto" }}>
            
            <Paper sx={{ p: 4, mb: 5, mt: 2, borderRadius: 4, bgcolor: "#ffffff", boxShadow: 8, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom sx={{ color: "primary.main" }}>
                    Benvenuto a "La Pergola", {user?.name || "Ospite"}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Un'esperienza culinaria indimenticabile, tra tradizione e innovazione. <br/>
                    Seleziona un tavolo e goditi la serata.
                </Typography>
            </Paper>

            <Paper sx={{ p: 4, mb: 5, borderRadius: 4, bgcolor: "#ffffff", boxShadow: 8 }} elevation={4}>
                <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    🥂 Riserva il tuo Tavolo
                </Typography>
                <form onSubmit={handleBookTable}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth type="date" label="Data della visita" InputLabelProps={{ shrink: true }} value={date} onChange={e => setDate(e.target.value)} required />
                        </Grid>
                        
                        <Grid item xs={12} sm={4}>
                            <TextField select fullWidth label="Orario" value={time} onChange={e => setTime(e.target.value)} required>
                                {timeSlots.map((slot) => (
                                    <MenuItem key={slot} value={slot}>
                                        {slot}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth type="number" label="Ospiti" inputProps={{ min: 1, max: 20 }} value={people} onChange={e => setPeople(e.target.value)} required />
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 3, textAlign: "right" }}>
                        <Button type="submit" variant="contained" color="secondary" size="large" sx={{ fontWeight: "bold", color: "#000" }}>
                            Conferma Prenotazione
                        </Button>
                    </Box>
                </form>
            </Paper>

            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "white", textShadow: "2px 2px 8px rgba(0,0,0,0.9)", mt: 5 }}>
                Le tue Prenotazioni
            </Typography>
            
            {reservations.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center", bgcolor: "#ffffff", borderRadius: 4 }}>
                    <Typography color="textSecondary" variant="h6">Non hai ancora prenotato alcun tavolo. Ti aspettiamo!</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    {reservations.map((res) => (
                        <Grid item xs={12} md={6} key={res._id}>
                            <Paper sx={{ p: 3, borderRadius: 4, borderLeft: "8px solid", borderColor: "secondary.main", bgcolor: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: 6, transition: "0.3s", "&:hover": { boxShadow: 12, transform: "translateY(-4px)" } }}>
                                <Box>
                                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                                        📅 {new Date(res.date).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                                        ⏰ Ore: <strong>{res.time}</strong>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        👥 Tavolo per {res.numberOfPeople} persone
                                    </Typography>
                                </Box>
                                <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(res._id)}>
                                    Disdici
                                </Button>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Divider sx={{ my: 5, bgcolor: 'rgba(255,255,255,0.2)' }} />

            {/* SEZIONE DOVE SIAMO - GOOGLE MAPS */}
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "white", textShadow: "2px 2px 8px rgba(0,0,0,0.9)", mt: 4 }}>
                Dove Siamo
            </Typography>
            <Paper sx={{ p: 2, borderRadius: 4, bgcolor: "#ffffff", boxShadow: 8 }}>
                <Typography variant="h6" gutterBottom color="primary.main" sx={{ fontWeight: 'bold' }}>
                    📍 La Pergola c/o Dipartimento DEI, Politecnico di Bari
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Via Edoardo Orabona, 4, 70125 Bari BA
                </Typography>
                
                {/* Iframe pulito e responsive di Google Maps */}
                <Box sx={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden' }}>
                    <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight="0" 
                        marginWidth="0" 
                        src="https://www.google.com/maps?q=Dipartimento+DEI+Politecnico+di+Bari&output=embed"
                        title="Mappa Ristorante"
                        style={{ border: 0 }}
                        allowFullScreen
                    ></iframe>
                </Box>
            </Paper>

        </Box>
    );
}
