import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Funzione asincrona per il login
    const login = async (email, password) => {
        try {
            // TEMPORANEO: finché non abbiamo il backend, simuliamo il successo!
            // const response = await api.post("/auth/login", { email, password });
            // const { token, userData } = response.data;
            
            const token = "mock_token_123";
            const userData = { username: "Studente", email: email };
            
            localStorage.setItem("token", token);
            setUser(userData);
        } catch (error) {
            console.error("Errore di login", error);
            throw error;
        }
    };

    // Funzione di logout
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
