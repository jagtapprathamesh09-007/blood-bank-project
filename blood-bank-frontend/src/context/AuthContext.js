import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkLoggedIn = async () => {
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined') {
            try {
                API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const res = await API.get('/auth/me');
                setUser(res.data.user || res.data);
            } catch (error) {
                console.error('Session expired or invalid token:', error);
                logout();
            }
        } else {
            logout();
        }
        setLoading(false);
    };

    useEffect(() => {
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const res = await API.post('/auth/login', { email, password });
        
        // Backend returns: { success: true, user: { _id, name, email, role, token } }
        const responseUser = res.data.user || res.data;
        const userToken = responseUser.token || res.data.token;

        if (userToken) {
            localStorage.setItem('token', userToken);
            API.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        }

        setUser(responseUser);
        return responseUser;
    };

    const register = async (userDataInput) => {
        const res = await API.post('/auth/register', userDataInput);
        
        const responseUser = res.data.user || res.data;
        const userToken = responseUser.token || res.data.token;

        if (userToken) {
            localStorage.setItem('token', userToken);
            API.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        }

        setUser(responseUser);
        return responseUser;
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete API.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};