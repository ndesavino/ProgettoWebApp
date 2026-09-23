import axios from 'axios';

// Creazione di un'istanza base di Axios
const api = axios.create({
    baseURL: 'http://localhost:3000/api', // L'URL del tuo backend Node.js
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