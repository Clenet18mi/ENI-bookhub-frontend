import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalBooks: number;
  availableBooks: number;
  activeLoans: number;
  overdueLoans: number;
  returnedThisMonth: number;
  totalReservations: number;
  pendingReservations: number;
  topBooks: TopBook[];
  loansByMonth: MonthStat[];
  usersByRole: RoleStat[];
  recentActivity: ActivityItem[];
}

export interface TopBook {
  title: string;
  author: string;
  loanCount: number;
}

export interface MonthStat {
  month: string;
  loans: number;
  returns: number;
}

export interface RoleStat {
  role: string;
  count: number;
}

export interface ActivityItem {
  type: 'loan' | 'return' | 'register' | 'reservation';
  userName: string;
  bookTitle?: string;
  date: string;
}

// ─── Données fictives de démonstration ───────────────────────────────────────

const MOCK_STATS: AdminDashboardStats = {
  totalUsers: 47,
  activeUsers: 43,
  inactiveUsers: 4,
  totalBooks: 128,
  availableBooks: 89,
  activeLoans: 34,
  overdueLoans: 6,
  returnedThisMonth: 28,
  totalReservations: 12,
  pendingReservations: 9,
  topBooks: [
    { title: 'Dune', author: 'Frank Herbert', loanCount: 24 },
    { title: 'Le Petit Prince', author: 'Antoine de Saint-Exupéry', loanCount: 21 },
    { title: '1984', author: 'George Orwell', loanCount: 18 },
    { title: 'Harry Potter', author: 'J.K. Rowling', loanCount: 17 },
    { title: 'Les Misérables', author: 'Victor Hugo', loanCount: 15 },
  ],
  loansByMonth: [
    { month: 'Nov', loans: 18, returns: 15 },
    { month: 'Déc', loans: 12, returns: 14 },
    { month: 'Jan', loans: 22, returns: 18 },
    { month: 'Fév', loans: 27, returns: 24 },
    { month: 'Mar', loans: 31, returns: 28 },
    { month: 'Avr', loans: 34, returns: 28 },
  ],
  usersByRole: [
    { role: 'Lecteurs', count: 40 },
    { role: 'Bibliothécaires', count: 5 },
    { role: 'Administrateurs', count: 2 },
  ],
  recentActivity: [
    { type: 'loan', userName: 'Claire Lefebvre', bookTitle: 'Fondation', date: '2026-04-26' },
    { type: 'return', userName: 'David Moreau', bookTitle: '1984', date: '2026-04-25' },
    { type: 'register', userName: 'Lucas Martin', date: '2026-04-25' },
    { type: 'reservation', userName: 'Emma Simon', bookTitle: 'Dune', date: '2026-04-24' },
    { type: 'loan', userName: 'François Bernard', bookTitle: 'Harry Potter', date: '2026-04-24' },
    { type: 'return', userName: 'Alice Dupont', bookTitle: 'Le Petit Prince', date: '2026-04-23' },
    { type: 'loan', userName: 'Sophie Laurent', bookTitle: 'Clean Code', date: '2026-04-22' },
  ],
};

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly http = inject(HttpClient);
  readonly dashStats = signal<AdminDashboardStats | null>(null);

  loadDashboardStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>('admin/dashboard').pipe(
      tap((s) => this.dashStats.set(s)),
      catchError(() => {
        // Fallback sur les données mock si l'API n'est pas encore disponible
        this.dashStats.set(MOCK_STATS);
        return of(MOCK_STATS);
      })
    );
  }
}