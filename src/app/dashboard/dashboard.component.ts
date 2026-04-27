import { Component, OnInit, Signal, inject, signal, computed } from '@angular/core';
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
import { DashboardService } from './services/dashboard.service';
import { ProfileService } from '../profile/profile.service';
import { LoanResponse } from './models/loan-response.model';
import { MatTableModule } from '@angular/material/table';
import { ReturnConfirmationDialogComponent } from '../common/components/return-confirmation-dialog/return-confirmation-dialog';
import { LoansService } from '../loans/loans.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatTooltipModule,
    MatProgressSpinnerModule, MatCardModule, MatChipsModule, MatDividerModule, MatTableModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  private readonly dashService = inject(AdminDashboardService);
  private readonly dashboardSvc = inject(DashboardService);
  private readonly loanService = inject(LoansService);
  private readonly profileService = inject(ProfileService);
  private readonly dialog = inject(MatDialog);


  readonly loading = signal(true);
  readonly allLoans = signal<LoanResponse[]>([]);
  readonly s: Signal<AdminDashboardStats | null> = this.dashService.dashStats as Signal<AdminDashboardStats | null>;

  readonly isAdmin = computed(() => this.profileService.currentProfile()?.role === 'ROLE_ADMIN');
  readonly isLibrarian = computed(() => this.profileService.currentProfile()?.role === 'ROLE_LIBRARIAN');
  readonly userName = computed(() => this.profileService.currentProfile()?.firstName ?? 'vous');

  // Données lecteur
  readonly stats = this.dashboardSvc.getStats();
  readonly recentLoans = this.dashboardSvc.getRecentLoans();
  readonly reservations = this.dashboardSvc.getReservations();

  readonly overdueLoans = computed(() =>
    this.allLoans().filter(loan => loan.status === 'OVERDUE')
  );

  readonly overdueCount = computed(() => this.overdueLoans().length);

  readonly today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  ngOnInit(): void {
    // if (!this.isAdmin()) {
    //   this.loading.set(false);
    //   return;
    // }

    this.loadAdminDashboard();
    this.dashService.loadDashboardStats().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
    this.loadAllLoans();
  }


  reload(): void {
    if (!this.isAdmin()) {
      return;
    }

    this.loadAdminDashboard();
  }

  private loadAdminDashboard(): void {
    this.loading.set(true);

    this.dashService.loadDashboardStats().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  barHeight(val: number, months: { loans: number; returns: number }[]): number {
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
      const seg = { ...r, color: colors[i], dash, offset: -offset * circumference / (total || 1) };
      offset += r.count;
      return seg;
    });
  }

  activityIcon(type: string): string {
    return { loan: 'menu_book', return: 'assignment_return', register: 'person_add', reservation: 'bookmark' }[type] ?? 'circle';
  }

  activityLabel(type: string, bookTitle?: string | null): string {
    const book = bookTitle ? `"${bookTitle}"` : '';
    return { loan: `a emprunté ${book}`, return: `a retourné ${book}`, register: "vient de s'inscrire", reservation: `a réservé ${book}` }[type] ?? '';
  }


  markAsReturned(loan: LoanResponse) {
    const dialogRef = this.dialog.open(ReturnConfirmationDialogComponent, {
      data: {
        loanId: loan.id,
        bookTitle: loan.bookTitle,
        userFullName: loan.userFullName
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.loanService.returnLoan(loan.id).subscribe({
          next: () => {
            this.loadAllLoans();
          },
          error: (err) => console.error('Erreur retour', err)
        });
      }
    });
  }

  private loadAllLoans(): void {
    this.loanService.getAllLoans().subscribe({
      next: (loans) => this.allLoans.set(loans),
      error: (err) => console.error(err)
    });
  }

  exportLoans(): void {
    console.log('Exportation des emprunts demandée...');
    // Plus tard, tu pourras générer un CSV ici
    const data = this.allLoans();
    if (data.length === 0) return;

    console.table(data); // Un petit aperçu en console en attendant
    alert('Fonctionnalité d\'export bientôt disponible !');
  }

  calculateDaysRemaining(dueDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // On remet à zéro pour comparer uniquement les jours

    const end = new Date(dueDate);
    end.setHours(0, 0, 0, 0);

    const diffInMs = end.getTime() - today.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays;
  }

}
