import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
  role: 'ROLE_USER' | 'ROLE_LIBRARIAN' | 'ROLE_ADMIN';
}

export interface AuthSession {
  accessToken: string;
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

// Correspond au LoginResponseDTO du backend
interface LoginResponseDTO {
  token: string;
  email: string;
  role: 'ROLE_USER' | 'ROLE_LIBRARIAN' | 'ROLE_ADMIN';
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly sessionKey = 'bookhub_session';
  private readonly storagePrefix = 'bookhub_';
  private readonly http: HttpClient = inject(HttpClient);

  /**
   * Appel réel au backend POST /api/auth/login
   * Stocke le JWT renvoyé dans le localStorage
   */
  login(payload: LoginRequest): Observable<LoginResponseDTO> {
    return this.http.post<LoginResponseDTO>('auth/login', {
      email: payload.email,
      password: payload.password,
    }).pipe(
      tap((response) => {
        const session: AuthSession = {
          accessToken: response.token,
          expiresAt: this.buildExpiry(),
          user: {
            firstName: this.extractFirstName(response.email),
            lastName: '',
            email: response.email,
            role: response.role,
          },
        };
        this.saveSession(session);
      })
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post('auth/register', userData);
  }

  saveSession(session: AuthSession): void {
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
  }

  getSession(): AuthSession | null {
    const raw = localStorage.getItem(this.sessionKey);
    if (!raw) return null;

    try {
      const session = JSON.parse(raw) as AuthSession;
      if (!session.expiresAt || Date.parse(session.expiresAt) <= Date.now()) {
        this.clearSession();
        return null;
      }
      return session;
    } catch {
      this.clearSession();
      return null;
    }
  }
  getRole(): string | null {
    return this.getSession()?.user.role ?? null;
  }

  getToken(): string | null {
    return this.getSession()?.accessToken ?? null;
  }

  hasValidSession(): boolean {
    return this.getSession() !== null;
  }

  clearSession(): void {
    localStorage.removeItem(this.sessionKey);
  }

  resetClientState(): void {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.storagePrefix))
      .forEach((key) => localStorage.removeItem(key));
  }

  logout(): void {
    this.clearSession();
  }

  // Expiration côté front alignée sur le JWT backend : 24h
  private buildExpiry(): string {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    return expiresAt.toISOString();
  }

  private extractFirstName(email: string): string {
    const localPart = email.split('@')[0] ?? 'lecteur';
    const base = localPart.split(/[._-]/)[0] ?? localPart;
    return base ? base.charAt(0).toUpperCase() + base.slice(1).toLowerCase() : 'Lecteur';
  }
}
