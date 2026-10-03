export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  user?: User;
  message?: string;
}

export interface JwtPayload {
  userId?: string | number;
  email?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export interface BackendRegisterResponse {
  message: string;
  user: {
    id: string | number;
    email: string;
    createAt?: string;
    createdAt?: string;
  };
}

export interface BackendLoginResponse {
  message: string;
  token: string;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

