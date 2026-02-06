import React, { createContext, useContext, useState } from 'react';
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

interface LoginResponse {
    user: User;
    token: string;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('@flash:user');
        const storedToken = localStorage.getItem('@flash:token');

        if (storedUser && storedToken) {
            return JSON.parse(storedUser) as User;
        }

        return null;
    });
    const [loading] = useState(false);

    async function signIn(email: string, password: string) {
        // Reduzido para usar instãncia centralizada
        const response = await api.post<LoginResponse>('/login', {
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
