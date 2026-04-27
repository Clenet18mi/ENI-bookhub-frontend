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
  /** Présent uniquement après une désactivation avec réservations annulées. */
  hadActiveReservations?: boolean;
  /** Présent uniquement après une suppression RGPD avec emprunts en cours. */
  hadActiveLoans?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalBooks: number;
  activeLoans: number;
  overdueLoans: number;
  totalReservations?: number;
  pendingReservations?: number;
  returnedThisMonth?: number;
  mostBorrowedCategory?: string;
}

export interface AdminLoan {
  id: number;
  bookTitle: string;
  bookAuthor: string;
  bookIsbn?: string;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
}

export interface AdminReservation {
  id: number;
  bookTitle: string;
  bookAuthor: string;
  reservationDate: string;
  rank: number;
  status: 'PENDING' | 'WAITING' | 'AVAILABLE' | 'BORROWED' | 'CANCELLED' | 'CANCELED';
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  readonly users = signal<AdminUser[]>([]);
  readonly stats = signal<AdminStats | null>(null);

  // ── Statistiques ──────────────────────────────────────────────────────────

  loadStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>('admin/stats').pipe(
      tap((s) => this.stats.set(s))
    );
  }

  // ── Utilisateurs ──────────────────────────────────────────────────────────

  loadUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>('admin/users').pipe(
      tap((list) => this.users.set(list))
    );
  }

  updateRole(id: number, role: UserRole): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`admin/users/${id}/role`, { role }).pipe(
      tap((updated) => this.replaceInCache(updated))
    );
  }

  activateUser(id: number): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`admin/users/${id}/activate`, {}).pipe(
      tap((updated) => this.replaceInCache(updated))
    );
  }

  deactivateUser(id: number): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`admin/users/${id}/deactivate`, {}).pipe(
      tap((updated) => this.replaceInCache(updated))
    );
  }

  // ── Détails utilisateur ───────────────────────────────────────────────────

  getUserLoans(userId: number): Observable<AdminLoan[]> {
    return this.http.get<AdminLoan[]>(`admin/users/${userId}/loans`);
  }

  getUserReservations(userId: number): Observable<AdminReservation[]> {
    return this.http.get<AdminReservation[]>(`admin/users/${userId}/reservations`);
  }

  /** Vérifie si un user a des réservations actives avant de le désactiver. */
  hasActiveReservations(userId: number): Observable<{ hasActive: boolean }> {
    return this.http.get<{ hasActive: boolean }>(`admin/users/${userId}/has-active-reservations`);
  }

  /**
   * Anonymise (RGPD) un compte utilisateur (admin only).
   * Retourne l'utilisateur anonymisé avec `hadActiveLoans` si des emprunts
   * non rendus existaient (avertissement).
   * La ligne n'est PAS supprimée — elle est mise à jour avec des données neutres.
   */
  deleteUser(userId: number): Observable<AdminUser> {
    return this.http.delete<AdminUser>(`admin/users/${userId}`).pipe(
      tap((anonymized) => this.replaceInCache(anonymized))
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private replaceInCache(updated: AdminUser): void {
    this.users.update((list) =>
      list.map((u) => (u.id === updated.id ? updated : u))
    );
  }
}
