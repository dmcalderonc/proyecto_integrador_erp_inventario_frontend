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
      rol: UserRole;
    };
  };
}

export type UserRole = 'ADMIN' | 'SOLICITANTE' | 'BODEGUERO' | 'COMPRADOR';
