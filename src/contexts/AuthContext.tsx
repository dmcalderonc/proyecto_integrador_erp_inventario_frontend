import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginRequest, LoginResponse, UserRole } from '../types';
import { authApi } from '../api/auth.api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: LoginRequest) => Promise<void>;
    loginWithToken: (token: string) => void;
    logout: () => void;
    updateProfile: (fotoPerfil: string | null) => void;
    updateGoogleId: (googleId: string | null, avatarUrl?: string | null) => void;
    hasRole: (allowedRoles: UserRole[]) => boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseUserFromToken(token: string): User | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            id: payload.sub || payload.id,
            nombre: payload.nombre || payload.email,
            email: payload.email || '',
            rol: payload.rol,
            estado: true,
            fechaCreacion: '',
            fechaActualizacion: '',
            fotoPerfil: payload.fotoPerfil || undefined,
            googleId: payload.googleId || undefined,
            avatarUrl: payload.avatarUrl || undefined,
        };
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            localStorage.removeItem('user');
            return null;
        }
    });

    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('token');
    });

    const login = async (credentials: LoginRequest) => {
        const { data } = await authApi.login(credentials) as { data: LoginResponse };

        setToken(data.data.access_token);

        const rawUser = data.data.user;
        const userData: User = {
            id: rawUser.id,
            nombre: rawUser.nombre,
            email: rawUser.email,
            rol: rawUser.rol,
            estado: true,
            fechaCreacion: '',
            fechaActualizacion: '',
            fotoPerfil: (rawUser as any).fotoPerfil ?? undefined,
            googleId: rawUser.googleId ?? undefined,
            avatarUrl: rawUser.avatarUrl ?? undefined,
        };
        setUser(userData);

        localStorage.setItem('token', data.data.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const loginWithToken = (accessToken: string) => {
        setToken(accessToken);
        localStorage.setItem('token', accessToken);

        const userData = parseUserFromToken(accessToken);
        if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const updateProfile = (fotoPerfil: string | null) => {
        if (!user) return;
        const updated = { ...user, fotoPerfil: fotoPerfil ?? undefined };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
    };

    const updateGoogleId = (googleId: string | null, avatarUrl?: string | null) => {
        if (!user) return;
        const updated = { ...user, googleId: googleId ?? undefined, avatarUrl: avatarUrl ?? undefined };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
    };

    const hasRole = (allowedRoles: UserRole[]) => {
        if (!user) return false;
        return allowedRoles.includes(user.rol);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            loginWithToken,
            logout,
            updateProfile,
            updateGoogleId,
            hasRole,
            isAuthenticated: !!token
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};
