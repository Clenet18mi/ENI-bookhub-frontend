import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
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

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly sessionKey = 'bookhub_session';
  private readonly storagePrefix = 'bookhub_';
  private readonly http: HttpClient = inject(HttpClient);


  login(payload: LoginRequest): AuthSession {
    return this.startSession(
      {
        firstName: this.extractFirstName(payload.email),
        lastName: 'Lecteur',
        email: payload.email.trim().toLowerCase(),
      },
      payload.rememberMe ?? true,
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post('auth/register', userData);
  }


  createDevSession(): AuthSession {
    return this.startSession(
      {
        firstName: 'Demo',
        lastName: 'Lecteur',
        email: 'dev@bookhub.local',
      },
      true,
    );
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
      const session = JSON.parse(raw) as AuthSession;
      if (!session.expiresAt || Number.isNaN(Date.parse(session.expiresAt)) || Date.parse(session.expiresAt) <= Date.now()) {
        this.clearSession();
        return null;
      }

      return session;
    } catch {
      this.clearSession();
      return null;
    }
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

  private startSession(user: AuthUser, rememberMe: boolean): AuthSession {
    this.resetClientState();

    const session: AuthSession = {
      accessToken: this.createToken('access'),
      refreshToken: this.createToken('refresh'),
      expiresAt: this.buildExpiry(rememberMe),
      user,
    };

    this.saveSession(session);
    return session;
  }

  private buildExpiry(rememberMe: boolean): string {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (rememberMe ? 24 * 7 : 8));
    return expiresAt.toISOString();
  }

  private extractFirstName(email: string): string {
    const localPart = email.split('@')[0] ?? 'lecteur';
    const base = localPart.split(/[._-]/)[0] ?? localPart;
    return base ? base.charAt(0).toUpperCase() + base.slice(1).toLowerCase() : 'Lecteur';
  }

  private createToken(prefix: string): string {
    const suffix = globalThis.crypto?.randomUUID?.() ?? `${Math.random().toString(36).slice(2)}-${Date.now()}`;
    return `${prefix}-${suffix}`;
  }
}
