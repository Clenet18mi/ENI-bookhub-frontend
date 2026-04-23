import { Injectable } from '@angular/core';

export interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
  role: 'reader';
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'LIBRARIAN' | 'ADMIN';
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/auth';

  login(payload: LoginRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/login`, payload);
  }

  register(payload: RegisterRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/register`, payload);
  }
}
