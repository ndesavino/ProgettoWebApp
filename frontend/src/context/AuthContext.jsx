import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Al refresh della pagina, recuperiamo l'utente salvato per non perdere la sessione
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error("Errore lettura utente da localStorage", err);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            }
        }
    }, []);

    // Funzione asincrona per il login
    const login = async (email, password) => {
        try {
            const response = await api.post("/auth/login", { email, password });
            const { token, userData, user: userInfo } = response.data;
            const finalUser = userData || userInfo;
            
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(finalUser));
            setUser(finalUser);
            return finalUser;
        } catch (error) {
            console.error("Errore di login", error);
            throw error;
        }
    };

    // Funzione di logout
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
