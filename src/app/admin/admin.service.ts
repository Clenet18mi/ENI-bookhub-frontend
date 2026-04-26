import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// ─── Modèles ──────────────────────────────────────────────────────────────────

export type UserRole = 'ROLE_USER' | 'ROLE_LIBRARIAN' | 'ROLE_ADMIN';

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalBooks: number;
  activeLoans: number;
  overdueLoans: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  /** Cache réactif de la liste des utilisateurs */
  readonly users = signal<AdminUser[]>([]);
  readonly stats = signal<AdminStats | null>(null);

  // ── Statistiques ────────────────────────────────────────────────────────────

  /** GET /api/admin/stats */
  loadStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>('admin/stats').pipe(
      tap((s) => this.stats.set(s))
    );
  }

  // ── Utilisateurs ────────────────────────────────────────────────────────────

  /** GET /api/admin/users */
  loadUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>('admin/users').pipe(
      tap((list) => this.users.set(list))
    );
  }

  /** PATCH /api/admin/users/{id}/role */
  updateRole(id: number, role: UserRole): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`admin/users/${id}/role`, { role }).pipe(
      tap((updated) => this.replaceInCache(updated))
    );
  }

  /** PATCH /api/admin/users/{id}/activate */
  activateUser(id: number): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`admin/users/${id}/activate`, {}).pipe(
      tap((updated) => this.replaceInCache(updated))
    );
  }

  /** PATCH /api/admin/users/{id}/deactivate */
  deactivateUser(id: number): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`admin/users/${id}/deactivate`, {}).pipe(
      tap((updated) => this.replaceInCache(updated))
    );
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private replaceInCache(updated: AdminUser): void {
    this.users.update((list) =>
      list.map((u) => (u.id === updated.id ? updated : u))
    );
  }
}
