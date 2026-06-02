import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AuthPage from './pages/AuthPage'; // Importiamo il nuovo componente strutturato

// Placeholder essenziali per le altre due sezioni
function Home() { return <main><h1>Pagina Iniziale Ristorante</h1><p>Benvenuti.</p></main>; }
function Dashboard() { return <main><h1>Le mie Prenotazioni</h1><p>Area protetta.</p></main>; }

function App() {
  return (
      <Router>
        <div>
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/login">Accedi / Registrati</Link></li>
              <li><Link to="/dashboard">Le mie Prenotazioni</Link></li>
            </ul>
          </nav>

          <hr />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<AuthPage />} /> {/* Collegato qui */}
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;