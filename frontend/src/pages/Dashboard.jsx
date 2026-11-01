import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { 
    Typography, Box, Paper, TextField, Button, Grid, Divider, MenuItem, 
    Chip, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Stack 
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import { io } from "socket.io-client";

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const [reservations, setReservations] = useState([]);
    
    // Form di creazione prenotazione
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);
    const [time, setTime] = useState("19:30");
    const [people, setPeople] = useState(2);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");

    // Stato per la Modifica (PUT)
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState(null);
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("19:30");
    const [editPeople, setEditPeople] = useState(2);
    const [editError, setEditError] = useState("");

    // Notifiche Real-Time Socket.IO
    const [liveNotice, setLiveNotice] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const timeSlots = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"];

    useEffect(() => {
        fetchReservations();

        // 🔔 REAL-TIME: Connessione Socket.IO dinamica
        const socketUrl = import.meta.env.VITE_API_URL 
            ? import.meta.env.VITE_API_URL.replace('/api', '') 
            : 'http://localhost:3000';
            
        const socket = io(socketUrl);
        socket.on("notifica-server", (messaggio) => {
            setLiveNotice(messaggio);
            setOpenSnackbar(true);
        });

        return () => socket.disconnect();
    }, []);

    // 1. GET - Recupero Prenotazioni
    const fetchReservations = async () => {
        try {
            const response = await api.get("/reservations");
            setReservations(response.data);
        } catch (error) {
            console.error("Errore nel recuperare le prenotazioni", error);
        }
    };

    // 2. POST - Creazione Prenotazione
    const handleBookTable = async (e) => {
        e.preventDefault();
        setFormError("");
        setFormSuccess("");
        try {
            await api.post("/reservations", { date, time, numberOfPeople: people });
            setFormSuccess("Tavolo prenotato con successo!");
            fetchReservations();
        } catch (error) {
            const msg = error.response?.data?.message || "Errore durante la prenotazione";
            setFormError(msg);
        }
    };

    // 3. APERTURA MODALE MODIFICA (PUT)
    const handleOpenEdit = (res) => {
        setEditingReservation(res);
        // Formattiamo la data per il campo <input type="date"> (YYYY-MM-DD)
        const formattedDate = res.date ? new Date(res.date).toISOString().split('T')[0] : today;
        setEditDate(formattedDate);
        setEditTime(res.time);
        setEditPeople(res.numberOfPeople);
        setEditError("");
        setEditDialogOpen(true);
    };

    const handleCloseEdit = () => {
        setEditDialogOpen(false);
        setEditingReservation(null);
        setEditError("");
    };

    // 4. PUT - Salvataggio Modifiche Prenotazione
    const handleSaveEdit = async () => {
        if (!editingReservation) return;
        setEditError("");
        try {
            await api.put(`/reservations/${editingReservation._id}`, {
                date: editDate,
                time: editTime,
                numberOfPeople: editPeople
            });
            handleCloseEdit();
            setFormSuccess("Prenotazione modificata con successo!");
            fetchReservations();
        } catch (error) {
            const msg = error.response?.data?.message || "Errore durante la modifica della prenotazione";
            setEditError(msg);
        }
    };
    
    // 5. DELETE - Cancellazione Prenotazione
    const handleDelete = async (id) => {
        if (window.confirm("Sei sicuro di voler disdire questa prenotazione?")) {
            try {
                await api.delete(`/reservations/${id}`);
                setFormSuccess("Prenotazione cancellata!");
                fetchReservations();
            } catch (error) {
                const msg = error.response?.data?.message || "Errore durante la disdetta";
                setFormError(msg);
            }
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 900, margin: "auto" }}>
            
            {/* INTESTAZIONE */}
            <Paper sx={{ p: 4, mb: 4, mt: 2, borderRadius: 4, bgcolor: "#ffffff", boxShadow: 8, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom sx={{ color: "primary.main", fontWeight: "bold" }}>
                    Benvenuto a "La Pergola", {user?.name || "Ospite"}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Un'esperienza culinaria indimenticabile, tra tradizione e innovazione. <br/>
                    Prenota e gestisci comodamente i tuoi tavoli in tempo reale.
                </Typography>
            </Paper>

            {/* MESSAGGI FEEDBACK FORM */}
            {formSuccess && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setFormSuccess("")}>
                    {formSuccess}
                </Alert>
            )}
            {formError && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setFormError("")}>
                    {formError}
                </Alert>
            )}

            {/* FORM CREAZIONE PRENOTAZIONE (POST) */}
            <Paper sx={{ p: 4, mb: 5, borderRadius: 4, bgcolor: "#ffffff", boxShadow: 8 }} elevation={4}>
                <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", mb: 3, fontWeight: "bold", color: "primary.main" }}>
                    🥂 Riserva il tuo Tavolo
                </Typography>
                <form onSubmit={handleBookTable}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <TextField 
                                fullWidth 
                                type="date" 
                                label="Data della visita" 
                                slotProps={{ inputLabel: { shrink: true } }}
                                inputProps={{ min: today }}
                                value={date} 
                                onChange={e => setDate(e.target.value)} 
                                required 
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={4}>
                            <TextField 
                                select 
                                fullWidth 
                                label="Orario" 
                                value={time} 
                                onChange={e => setTime(e.target.value)} 
                                required
                            >
                                {timeSlots.map((slot) => (
                                    <MenuItem key={slot} value={slot}>
                                        {slot}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        
                        <Grid item xs={12} sm={4}>
                            <TextField 
                                fullWidth 
                                type="number" 
                                label="Ospiti" 
                                inputProps={{ min: 1, max: 20 }} 
                                value={people} 
                                onChange={e => setPeople(e.target.value)} 
                                required 
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 3, textAlign: "right" }}>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="secondary" 
                            size="large" 
                            sx={{ fontWeight: "bold", color: "#000" }}
                        >
                            Conferma Prenotazione
                        </Button>
                    </Box>
                </form>
            </Paper>

            {/* SEZIONE PRENOTAZIONI ATTIVE (GET + PUT + DELETE) */}
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "white", textShadow: "2px 2px 8px rgba(0,0,0,0.9)", mt: 5 }}>
                Le tue Prenotazioni
            </Typography>
            
            {reservations.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center", bgcolor: "#ffffff", borderRadius: 4 }}>
                    <Typography color="textSecondary" variant="h6">
                        Non hai ancora prenotato alcun tavolo. Ti aspettiamo!
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    {reservations.map((res) => (
                        <Grid item xs={12} md={6} key={res._id}>
                            <Paper sx={{ 
                                p: 3, 
                                borderRadius: 4, 
                                borderLeft: "8px solid", 
                                borderColor: "secondary.main", 
                                bgcolor: "#ffffff", 
                                boxShadow: 6, 
                                transition: "0.3s", 
                                "&:hover": { boxShadow: 12, transform: "translateY(-4px)" } 
                            }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <EventIcon fontSize="small" /> {new Date(res.date).toLocaleDateString()}
                                    </Typography>
                                    <Chip 
                                        label={res.status === 'confermata' ? "Confermata" : (res.status || "Confermata")} 
                                        color={res.status === 'cancellata' ? "error" : "success"} 
                                        size="small" 
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </Box>

                                <Typography variant="body1" sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessTimeIcon fontSize="small" color="action" /> Ore: <strong>{res.time}</strong>
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PeopleIcon fontSize="small" color="action" /> Tavolo per <strong>{res.numberOfPeople} persone</strong>
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                {/* AZIONI: MODIFICA (PUT) E DISDICI (DELETE) */}
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <Button 
                                        variant="outlined" 
                                        color="primary" 
                                        size="small" 
                                        startIcon={<EditIcon />} 
                                        onClick={() => handleOpenEdit(res)}
                                        sx={{ fontWeight: 'bold' }}
                                    >
                                        Modifica
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        color="error" 
                                        size="small" 
                                        startIcon={<DeleteIcon />} 
                                        onClick={() => handleDelete(res._id)}
                                        sx={{ fontWeight: 'bold' }}
                                    >
                                        Disdici
                                    </Button>
                                </Stack>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* DIALOG MODALE DI MODIFICA (PUT) */}
            <Dialog open={editDialogOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    ✏️ Modifica Prenotazione
                </DialogTitle>
                <DialogContent dividers>
                    {editError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {editError}
                        </Alert>
                    )}
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField 
                            fullWidth 
                            type="date" 
                            label="Nuova Data" 
                            slotProps={{ inputLabel: { shrink: true } }}
                            inputProps={{ min: today }}
                            value={editDate} 
                            onChange={e => setEditDate(e.target.value)} 
                            required 
                        />
                        <TextField 
                            select 
                            fullWidth 
                            label="Nuovo Orario" 
                            value={editTime} 
                            onChange={e => setEditTime(e.target.value)} 
                            required
                        >
                            {timeSlots.map((slot) => (
                                <MenuItem key={slot} value={slot}>
                                    {slot}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField 
                            fullWidth 
                            type="number" 
                            label="Numero Ospiti" 
                            inputProps={{ min: 1, max: 20 }} 
                            value={editPeople} 
                            onChange={e => setEditPeople(e.target.value)} 
                            required 
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseEdit} color="inherit">
                        Annulla
                    </Button>
                    <Button 
                        onClick={handleSaveEdit} 
                        variant="contained" 
                        color="secondary" 
                        sx={{ fontWeight: 'bold', color: '#000' }}
                    >
                        Salva Modifiche
                    </Button>
                </DialogActions>
            </Dialog>

            {/* TOAST / SNACKBAR PER NOTIFICHE LIVE SOCKET.IO */}
            <Snackbar 
                open={openSnackbar} 
                autoHideDuration={6000} 
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity="info" sx={{ width: '100%', bgcolor: '#ffffff', color: '#000', boxShadow: 6 }}>
                    🔔 <strong>Live:</strong> {liveNotice}
                </Alert>
            </Snackbar>

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
