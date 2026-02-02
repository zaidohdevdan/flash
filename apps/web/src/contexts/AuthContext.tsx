import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'SUPERVISOR' | 'PROFESSIONAL' | 'ADMIN' | 'MANAGER';
    supervisorId: string | null;
    departmentId?: string | null;
    supervisorName?: string;
    avatarUrl?: string;
    statusPhrase?: string;
}

interface AuthContextData {
    user: User | null;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
    updateUser: (user: User) => void;
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
        }
        setLoading(false);
    }, []);

    async function signIn(email: string, password: string) {
        // Reduzido para usar instãncia centralizada
        const response = await api.post('/login', {
            email,
            password,
        });

        const { token, user } = response.data;

        localStorage.setItem('@flash:user', JSON.stringify(user));
        localStorage.setItem('@flash:token', token);

        setUser(user);
    }

    function signOut() {
        localStorage.removeItem('@flash:user');
        localStorage.removeItem('@flash:token');
        setUser(null);
    }

    function updateUser(userData: User) {
        localStorage.setItem('@flash:user', JSON.stringify(userData));
        setUser(userData);
    }

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, updateUser, isAuthenticated: !!user, loading }}>
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
