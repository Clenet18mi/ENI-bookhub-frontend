import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
<<<<<<< HEAD
  private readonly sessionKey = 'bookhub_session';
=======
  private readonly tokenKey = 'bookhub_token';
>>>>>>> origin/main
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/auth';

  login(payload: LoginRequest): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.baseUrl}/login`, payload);
  }

  register(payload: RegisterRequest): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.baseUrl}/register`, payload);
  }

  createDevSession(payload: LoginRequest): AuthSession {
    const now = Date.now();
    return {
      accessToken: `dev-access-${now}`,
      refreshToken: `dev-refresh-${now}`,
      expiresAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      user: {
        firstName: 'Marie',
        lastName: 'Dupont',
        email: payload.email,
        role: 'USER',
      },
    };
  }

  resetClientState(): void {
    this.clearSession();
    localStorage.removeItem('bookhub_theme');
    sessionStorage.clear();
  }

  saveSession(session: AuthSession): void {
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
  }

  getSession(): AuthSession | null {
    const raw = localStorage.getItem(this.sessionKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }

  hasValidSession(): boolean {
    const session = this.getSession();
    return Boolean(session && new Date(session.expiresAt).getTime() > Date.now());
  }

  clearSession(): void {
    localStorage.removeItem(this.sessionKey);
  }

  setDevSession(): void {
    localStorage.setItem(this.tokenKey, 'dev-token');
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
  }

  hasSession(): boolean {
    return Boolean(localStorage.getItem(this.tokenKey));
  }
}
