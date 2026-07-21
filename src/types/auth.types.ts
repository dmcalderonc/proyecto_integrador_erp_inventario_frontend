export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    access_token: string;
    user: {
      id: string;
      username: string;
      email: string;
      rol: UserRole;
      fotoPerfil?: string;
      googleId?: string;
      avatarUrl?: string;
    };
  };
}

export type UserRole = 'ADMIN' | 'SOLICITANTE' | 'BODEGUERO' | 'COMPRADOR';
