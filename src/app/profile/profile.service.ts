import { Injectable, inject, signal  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  readonly currentProfile = signal<UserProfile | null>(null);
  /** GET /api/users/me */
  getProfile(): Observable<UserProfile> {
   return this.http.get<UserProfile>('users/me').pipe(
    tap((profile) => this.currentProfile.set(profile)));
  }

  /** PATCH /api/users/me */
  updateProfile(payload: UpdateProfilePayload): Observable<UserProfile> {
    return this.http.patch<UserProfile>('users/me', payload).pipe(
      tap((updated) => this.currentProfile.set(updated))
    );
  }

  /** PATCH /api/users/me/password */
  changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.http.patch<void>('users/me/password', payload);
  }
}
