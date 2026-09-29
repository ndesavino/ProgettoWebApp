import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'

// Importiamo gli strumenti per il Tema di Material UI
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Creiamo un tema personalizzato con i colori di un Ristorante (es. Rosso scuro e Oro)
const theme = createTheme({
  palette: {
    primary: { main: '#800020' }, // Bordeaux scuro ed elegante
    secondary: { main: '#d4af37' }, // Oro puro
    text: {
      primary: '#202020',
    }
  },
  typography: {
    fontFamily: '"Lora", "Georgia", serif',
    h4: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
    h5: { fontFamily: '"Playfair Display", serif', fontWeight: 600 },
    h6: { fontFamily: '"Playfair Display", serif', fontWeight: 600, letterSpacing: 1 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Aggiungiamo una "patina" nera al 65% sopra l'immagine per scurirla e creare contrasto!
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.75)), url("https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      {/* CssBaseline resetta i margini di default del browser, come un file normalize.css */}
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)