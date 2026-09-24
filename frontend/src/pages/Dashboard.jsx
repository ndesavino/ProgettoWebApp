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

        const socket = io("http://localhost:3000");
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
            
            <Paper sx={{ p: 4, mb: 5, mt: 2, borderRadius: 3, bgcolor: "rgba(255, 255, 255, 0.90)", boxShadow: 5, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom sx={{ color: "primary.main" }}>
                    Benvenuto a "La Pergola", {user?.name || "Ospite"}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Un'esperienza culinaria indimenticabile, tra tradizione e innovazione. <br/>
                    Seleziona un tavolo e goditi la serata.
                </Typography>
            </Paper>

            <Paper sx={{ p: 4, mb: 5, borderRadius: 3, bgcolor: "rgba(255, 255, 255, 0.95)", boxShadow: 5 }} elevation={3}>
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
                        <Button type="submit" variant="contained" color="secondary" size="large" sx={{ fontWeight: "bold", color: "white" }}>
                            Conferma Prenotazione
                        </Button>
                    </Box>
                </form>
            </Paper>

            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "white", textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                Le tue Prenotazioni Attive
            </Typography>
            
            {reservations.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center", bgcolor: "rgba(255, 255, 255, 0.85)", borderRadius: 3 }}>
                    <Typography color="textSecondary" variant="h6">Non hai ancora prenotato alcun tavolo. Ti aspettiamo!</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    {reservations.map((res) => (
                        <Grid item xs={12} md={6} key={res._id}>
                            <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "6px solid", borderColor: "secondary.main", bgcolor: "rgba(255, 255, 255, 0.95)", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: 3, transition: "0.3s", "&:hover": { boxShadow: 8, transform: "translateY(-2px)" } }}>
                                <Box>
                                    <Typography variant="h6" color="primary.main">
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
        </Box>
    );
}
