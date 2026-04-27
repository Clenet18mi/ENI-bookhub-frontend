import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Loan, LoansService } from './loans.service';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './loans.component.html',
  styleUrl: './loans.component.scss'
})
export class LoansComponent implements OnInit {

  private readonly loansService = inject(LoansService);

  // ── État ──────────────────────────────────────────────────────────────────
  readonly loading = signal(true);
  readonly error = signal(false);
  private readonly _loans = signal<Loan[]>([]);

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly activeLoans = computed(() =>
    this._loans().filter((l) => l.status === 'ACTIVE' || l.status === 'PENDING')
  );
  readonly overdueLoans = computed(() =>
    this._loans().filter((l) => l.status === 'OVERDUE')
  );
  readonly activeAndOverdue = computed(() =>
    this._loans().filter((l) => l.status !== 'RETURNED')
  );
  readonly historyLoans = computed(() =>
    this._loans().filter((l) => l.status === 'RETURNED')
  );

  // ── Cycle de vie ──────────────────────────────────────────────────────────
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.loansService.getMyLoans().subscribe({
      next: (loans) => {
        this._loans.set(loans);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  // ── Helpers dates ────────────────────────────────────────────────────────

  /** Jours restants avant la date de retour (peut être négatif). */
  daysLeft(dueDate: string): number {
    const diff = new Date(dueDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86_400_000));
  }

  /** Jours de retard (emprunt actif). */
  daysLate(dueDate: string): number {
    const diff = Date.now() - new Date(dueDate).getTime();
    return Math.max(1, Math.ceil(diff / 86_400_000));
  }

  /** Retard sur un emprunt retourné. */
  daysLateHistory(dueDate: string, returnDate: string | null): number {
    if (!returnDate) return 0;
    const diff = new Date(returnDate).getTime() - new Date(dueDate).getTime();
    return Math.max(1, Math.ceil(diff / 86_400_000));
  }

  /** L'emprunt retourné l'a-t-il été en retard ? */
  wasLate(dueDate: string, returnDate: string | null): boolean {
    if (!returnDate) return false;
    return new Date(returnDate) > new Date(dueDate);
  }

  /** Durée totale d'un emprunt (en jours). */
  loanDuration(loanDate: string, returnDate: string): number {
    const diff = new Date(returnDate).getTime() - new Date(loanDate).getTime();
    return Math.max(1, Math.ceil(diff / 86_400_000));
  }

  /** Pourcentage de la durée d'emprunt écoulée (0–100). */
  progressPct(loanDate: string, dueDate: string): number {
    const start = new Date(loanDate).getTime();
    const end = new Date(dueDate).getTime();
    const now = Date.now();
    const total = end - start;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, ((now - start) / total) * 100));
  }

  // ── Helpers affichage ────────────────────────────────────────────────────
  statusLabel(status: string): string {
    return ({ ACTIVE: 'En cours', OVERDUE: 'En retard', RETURNED: 'Rendu', PENDING: 'En attente' } as Record<string, string>)[status] ?? status;
  }

  statusIcon(status: string): string {
    return ({ ACTIVE: 'check_circle', OVERDUE: 'warning_amber', RETURNED: 'assignment_return', PENDING: 'hourglass_empty' } as Record<string, string>)[status] ?? 'circle';
  }
}
