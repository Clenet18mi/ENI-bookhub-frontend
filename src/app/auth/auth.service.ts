import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environnments/environment';

export interface AuthUser {
  email: string;
  role: string;
}

export interface AuthSession {
  accessToken: string; // JWT renvoyé par le backend
  expiresAt: string; // Date d'expiration côté front
  user: AuthUser; // Infos utilisateur utiles dans l'app
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string; // JWT généré par le backend
  email: string;
  role: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionKey = 'bookhub_session';
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  login(payload: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, {
        // Normalisation de l'email
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      })
      .pipe(
        tap((response) => {
          // Création de la session côté front avec les infos du backend
          const session: AuthSession = {
            accessToken: response.token,
            expiresAt: this.buildExpiry(), // expiration alignée sur le JWT (24h)
            user: {
              email: response.email,
              role: response.role,
            },
          };

          // Sauvegarde dans le localStorage
          this.saveSession(session);
        }),
      );
  }

  register(payload: RegisterRequest) {
    return this.http.post(`${this.apiUrl}/register`, {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });
  }

  // Sauvegarde de la session dans le navigateur
  saveSession(session: AuthSession): void {
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
  }

  // Récupération de la session si elle est valide
  getSession(): AuthSession | null {
    const raw = localStorage.getItem(this.sessionKey);

    if (!raw) {
      return null;
    }

    try {
      const session = JSON.parse(raw) as AuthSession;

      // Vérifie si la session est expirée
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

  // Vérifie si un utilisateur est connecté
  hasValidSession(): boolean {
    return this.getSession() !== null;
  }

  // Supprime la session
  clearSession(): void {
    localStorage.removeItem(this.sessionKey);
  }

  logout(): void {
    this.clearSession();
  }

  // Définit une expiration à 24h, alignée sur le JWT backend
  private buildExpiry(): string {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    return expiresAt.toISOString();
  }
}
