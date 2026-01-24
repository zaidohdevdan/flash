import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'SUPERVISOR' | 'PROFESSIONAL' | 'ADMIN';
    supervisorId: string | null;
}

interface AuthContextData {
    user: User | null;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('@flash:user');
        const storedToken = localStorage.getItem('@flash:token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    async function signIn(email: string, password: string) {
        // URL do Backend (Assumindo localhost:3000 por enquanto)
        const response = await axios.post('http://localhost:3000/login', {
            email,
            password,
        });

        const { token, user } = response.data;

        localStorage.setItem('@flash:user', JSON.stringify(user));
        localStorage.setItem('@flash:token', token);

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
    }

    function signOut() {
        localStorage.removeItem('@flash:user');
        localStorage.removeItem('@flash:token');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
