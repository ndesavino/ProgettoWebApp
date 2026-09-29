import axios from 'axios';

// Creazione di un'istanza base di Axios
const api = axios.create({
    // In produzione userà l'URL remoto, in locale userà il localhost
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api', 
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor per aggiungere automaticamente il Token JWT ad ogni richiesta
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;