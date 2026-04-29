import {
  Component,
  OnInit,
  Signal,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { AdminDashboardService, AdminDashboardStats } from '../admin/admin-dashboard.service';
import { DashboardService, UserReservation } from './services/dashboard.service';
import { ProfileService } from '../profile/profile.service';
import { LoanResponse } from '../loans/models/loan-response.model';
import { MatTableModule } from '@angular/material/table';
import { ReturnConfirmationDialogComponent } from '../common/components/return-confirmation-dialog/return-confirmation-dialog';
import { LoansService } from '../loans/services/loans.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatTableModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly adminDashService = inject(AdminDashboardService);
  private readonly dashboardSvc = inject(DashboardService);
  private readonly loanService = inject(LoansService);
  private readonly profileService = inject(ProfileService);
  private readonly dialog = inject(MatDialog);

  // ─── État de chargement ─────────────────────────────────────────────────────
  readonly loading = signal(true);
  readonly userLoading = signal(false);

  // ─── Rôle de l'utilisateur connecté ────────────────────────────────────────
  readonly isAdmin = computed(
    () => this.profileService.currentProfile()?.role === 'ROLE_ADMIN'
  );
  readonly isLibrarian = computed(
    () => this.profileService.currentProfile()?.role === 'ROLE_LIBRARIAN'
  );
  readonly userName = computed(
    () => this.profileService.currentProfile()?.firstName ?? 'vous'
  );

  // ─── Données Admin / Bibliothécaire ────────────────────────────────────────
  readonly s: Signal<AdminDashboardStats | null> =
    this.adminDashService.dashStats as Signal<AdminDashboardStats | null>;

  /** Tous les emprunts (utilisé par la vue bibliothécaire). */
  readonly allLoans = signal<LoanResponse[]>([]);

  readonly overdueLoans = computed(() =>
    this.allLoans().filter((loan) => loan.status === 'OVERDUE')
  );
  readonly overdueCount = computed(() => this.overdueLoans().length);

  // ─── Données Lecteur (réelles, depuis l'API) ────────────────────────────────
  readonly myLoans = signal<LoanResponse[]>([]);
  readonly myReservations = signal<UserReservation[]>([]);

  /** Statistiques du lecteur calculées depuis les données réelles. */
  readonly userStats = computed(() => {
    const loans = this.myLoans();
    const reservations = this.myReservations();
    const activeLoans = loans.filter(
      (l) => l.status === 'ACTIVE' || l.status === 'OVERDUE'
    ).length;
    const activeReservations = reservations.filter(
      (r) => r.status === 'WAITING' || r.status === 'AVAILABLE'
    ).length;
    const overdue = loans.filter((l) => l.status === 'OVERDUE').length;

    return [
      {
        label: 'Emprunts en cours',
        value: String(activeLoans),
        hint: activeLoans === 1 ? 'livre emprunté' : 'livres empruntés',
        icon: 'menu_book',
        tone: 'forest' as const,
      },
      {
        label: 'Réservations',
        value: String(activeReservations),
        hint: activeReservations === 1 ? 'livre réservé' : 'livres réservés',
        icon: 'bookmark',
        tone: 'amber' as const,
      },
      {
        label: 'Alertes',
        value: String(overdue),
        hint: overdue === 1 ? 'retard en cours' : 'retards en cours',
        icon: 'warning_amber',
        tone: 'warn' as const,
      },
    ];
  });

  /** 5 emprunts les plus récents non retournés, en priorité les retardés. */
  readonly recentActiveLoans = computed(() =>
    this.myLoans()
      .filter((l) => l.status !== 'RETURNED')
      .sort((a, b) => {
        // Retardés en premier
        if (a.status === 'OVERDUE' && b.status !== 'OVERDUE') return -1;
        if (b.status === 'OVERDUE' && a.status !== 'OVERDUE') return 1;
        return new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime();
      })
      .slice(0, 5)
  );

  /** Réservations actives (WAITING ou AVAILABLE) triées par rang. */
  readonly activeReservations = computed(() =>
    this.myReservations()
      .filter((r) => r.status === 'WAITING' || r.status === 'AVAILABLE')
      .sort((a, b) => a.rank - b.rank)
  );

  // ─── Divers ─────────────────────────────────────────────────────────────────
  readonly today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Cycle de vie
  // ─────────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    if (this.isAdmin()) {
      // Admin : on charge uniquement les stats admin
      this.loadAdminDashboard();
    } else if (this.isLibrarian()) {
      // Bibliothécaire : on charge uniquement les emprunts (vue gestion)
      this.loading.set(false);
      this.loadAllLoans();
    } else {
      // Lecteur : on charge ses données personnelles — pas d'appel admin
      this.loading.set(false);
      this.loadUserDashboard();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Chargements
  // ─────────────────────────────────────────────────────────────────────────────

  /** Recharge les stats admin (bouton Actualiser). */
  reload(): void {
    if (!this.isAdmin()) return;
    this.loadAdminDashboard();
  }

  private loadAdminDashboard(): void {
    this.loading.set(true);
    this.adminDashService.loadDashboardStats().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  private loadAllLoans(): void {
    this.loanService.getAllLoans().subscribe({
      next: (loans) => this.allLoans.set(loans),
      error: (err) => console.error('Erreur chargement emprunts', err),
    });
  }

  /** Charge en parallèle les emprunts et réservations du lecteur connecté. */
  private loadUserDashboard(): void {
    this.userLoading.set(true);

    this.dashboardSvc.getMyLoans().subscribe({
      next: (loans) => this.myLoans.set(loans),
      error: (err) => console.error('Erreur chargement emprunts lecteur', err),
    });

    this.dashboardSvc.getMyReservations().subscribe({
      next: (reservations) => {
        this.myReservations.set(reservations);
        this.userLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement réservations lecteur', err);
        this.userLoading.set(false);
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers vue Admin
  // ─────────────────────────────────────────────────────────────────────────────

  barHeight(
    val: number,
    months: { loans: number; returns: number }[]
  ): number {
    const max = Math.max(...months.map((m) => Math.max(m.loans, m.returns)));
    return max > 0 ? Math.max(6, (val / max) * 120) : 6;
  }

  donutSegments(roles: { role: string; count: number }[]) {
    const colors = ['#1f4d3a', '#6366f1', '#f59e0b'];
    const total = roles.reduce((s, r) => s + r.count, 0);
    const circumference = 2 * Math.PI * 45;
    let offset = 0;
    return roles.map((r, i) => {
      const pct = total > 0 ? r.count / total : 0;
      const dash = `${pct * circumference} ${circumference}`;
      const seg = {
        ...r,
        color: colors[i],
        dash,
        offset: (-offset * circumference) / (total || 1),
      };
      offset += r.count;
      return seg;
    });
  }

  activityIcon(type: string): string {
    return (
      {
        loan: 'menu_book',
        return: 'assignment_return',
        register: 'person_add',
        reservation: 'bookmark',
      }[type] ?? 'circle'
    );
  }

  activityLabel(type: string, bookTitle?: string | null): string {
    const book = bookTitle ? `"${bookTitle}"` : '';
    return (
      {
        loan: `a emprunté ${book}`,
        return: `a retourné ${book}`,
        register: "vient de s'inscrire",
        reservation: `a réservé ${book}`,
      }[type] ?? ''
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers vue Bibliothécaire
  // ─────────────────────────────────────────────────────────────────────────────

  markAsReturned(loan: LoanResponse) {
    const dialogRef = this.dialog.open(ReturnConfirmationDialogComponent, {
      data: {
        loanId: loan.id,
        bookTitle: loan.bookTitle,
        userFullName: loan.userFullName,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.loanService.returnLoan(loan.id).subscribe({
          next: () => this.loadAllLoans(),
          error: (err) => console.error('Erreur retour', err),
        });
      }
    });
  }

  exportLoans(): void {
    const data = this.allLoans();
    if (data.length === 0) return;
    alert("Fonctionnalité d'export bientôt disponible !");
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers vue Lecteur
  // ─────────────────────────────────────────────────────────────────────────────

  calculateDaysRemaining(dueDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(dueDate);
    end.setHours(0, 0, 0, 0);
    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  formatDueDate(dueDate: string): string {
    return new Date(dueDate).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  loanStatusLabel(status: string): string {
    return { ACTIVE: 'En cours', OVERDUE: 'RETARD', PENDING: 'En attente' }[status] ?? status;
  }

  reservationStatusLabel(status: UserReservation['status']): string {
    return (
      { WAITING: 'En attente', AVAILABLE: 'Disponible !', BORROWED: 'Emprunté', CANCELED: 'Annulé' }[status] ?? status
    );
  }

  reservationChips(r: UserReservation): string[] {
    const chips = [`Position ${r.rank}`];
    if (r.status === 'AVAILABLE') chips.push('Disponible maintenant');
    else if (r.status === 'WAITING') chips.push('En attente');
    return chips;
  }
}
