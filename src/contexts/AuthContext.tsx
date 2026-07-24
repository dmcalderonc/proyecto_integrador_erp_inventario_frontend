import { createContext, useCallback, useContext, useState } from 'react';
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
    hasAnyRole: (roles: UserRole[]) => boolean;
    refreshUser: (newToken?: string) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) return false;
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}

function parseUserFromToken(token: string): User | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            id: payload.sub || payload.id,
            nombre: payload.nombre || payload.email,
            email: payload.email || '',
            rol: payload.rol,
            estado: payload.estado ?? true,
            isActive: payload.isActive ?? true,
            fechaCreacion: '',
            fechaActualizacion: '',
            fotoPerfil: payload.fotoPerfil || undefined,
            googleId: payload.googleId || undefined,
            avatarUrl: payload.avatarUrl || undefined,
            bodegaIds: payload.bodegaIds || [],
        };
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const savedUser = localStorage.getItem('user');
            if (!savedUser) return null;
            const parsed = JSON.parse(savedUser) as User;
            const savedToken = localStorage.getItem('token');
            if (savedToken && isTokenExpired(savedToken)) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                return null;
            }
            return parsed;
        } catch {
            localStorage.removeItem('user');
            return null;
        }
    });

    const [token, setToken] = useState<string | null>(() => {
        const saved = localStorage.getItem('token');
        if (saved && isTokenExpired(saved)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return null;
        }
        return saved;
    });

    const login = useCallback(async (credentials: LoginRequest) => {
        const { data } = await authApi.login(credentials) as { data: LoginResponse };

        setToken(data.data.access_token);

        const rawUser = data.data.user;
        const userData: User = {
            id: rawUser.id,
            nombre: rawUser.nombre,
            email: rawUser.email,
            rol: rawUser.rol,
            estado: true,
            isActive: true,
            fechaCreacion: '',
            fechaActualizacion: '',
            fotoPerfil: (rawUser as any).fotoPerfil ?? undefined,
            googleId: rawUser.googleId ?? undefined,
            avatarUrl: rawUser.avatarUrl ?? undefined,
        };
        setUser(userData);

        localStorage.setItem('token', data.data.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
    }, []);

    const loginWithToken = useCallback((accessToken: string) => {
        if (isTokenExpired(accessToken)) return;
        setToken(accessToken);
        localStorage.setItem('token', accessToken);

        const userData = parseUserFromToken(accessToken);
        if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    const updateProfile = useCallback((fotoPerfil: string | null) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, fotoPerfil: fotoPerfil ?? undefined };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const updateGoogleId = useCallback((googleId: string | null, avatarUrl?: string | null) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, googleId: googleId ?? undefined, avatarUrl: avatarUrl ?? undefined };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const hasRole = useCallback((allowedRoles: UserRole[]) => {
        if (!user) return false;
        return allowedRoles.includes(user.rol);
    }, [user]);

    const hasAnyRole = useCallback((roles: UserRole[]) => {
        if (!user) return false;
        return roles.includes(user.rol);
    }, [user]);

    const refreshUser = useCallback((newToken?: string) => {
        const tokenToUse = newToken || token;
        if (!tokenToUse) return;
        if (isTokenExpired(tokenToUse)) {
            logout();
            return;
        }
        if (newToken) {
            setToken(newToken);
            localStorage.setItem('token', newToken);
        }
        const userData = parseUserFromToken(tokenToUse);
        if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        }
    }, [token, logout]);

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
            hasAnyRole,
            refreshUser,
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
