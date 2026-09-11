import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        const onUnauthorized = () => {
            setUser(null);
            setLoading(false);
        };
        window.addEventListener('auth:unauthorized', onUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
    }, []);

    const checkAuth = async () => {
        try {
            const { data } = await api.get('/auth/me');
            if (data && data.username) {
                setUser(data);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        const { data } = await api.post('/auth/login', { username, password });
        setUser(data);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // ignore network errors, still clear local state and cookie
        }
        try {
            document.cookie = 'JSESSIONID=; Max-Age=0; path=/';
        } catch {
            // ignore
        }
        setUser(null);
    };

    const refreshUser = async () => {
        await checkAuth();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}