import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReservationItem, ReservationStatus } from './reservation.model';
import { ReservationsService } from './reservations.service';
import { ReservationCancelDialogComponent } from './reservation-cancel-dialog.component';

/**
 * Page "Mes réservations" (US-RESA-02).
 *
 * Affiche la liste des réservations de l'utilisateur avec :
 *  - rang dans la file d'attente
 *  - statut (PENDING / AVAILABLE / BORROWED / CANCELLED)
 *  - bouton d'annulation conditionnel (PENDING | AVAILABLE uniquement)
 *  - les réservations annulées sont toujours affichées en bas de liste
 *  - filtre par statut : Toutes / En attente / Disponible / Annulée
 */
@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss',
})
export class ReservationsComponent implements OnInit {

  private readonly reservationsService = inject(ReservationsService);
  private readonly snackBar            = inject(MatSnackBar);
  private readonly dialog              = inject(MatDialog);

  readonly reservations = signal<ReservationItem[]>([]);
  readonly loading      = signal(true);
  readonly error        = signal<string | null>(null);
  readonly cancelling   = signal<number | null>(null);

  /** Filtre actif sur le statut. 'ALL' = toutes sauf aucun filtre. */
  statusFilter = signal<ReservationStatus | 'ALL'>('ALL');

  readonly activeCount    = computed(() => this.reservations().filter(r => r.status === 'PENDING').length);
  readonly availableCount = computed(() => this.reservations().filter(r => r.status === 'AVAILABLE').length);
  readonly cancelledCount = computed(() => this.reservations().filter(r => r.status === 'CANCELLED').length);

  /**
   * Liste filtrée + triée :
   *  1. Actives (PENDING, AVAILABLE, BORROWED) → triées par date desc
   *  2. Annulées (CANCELLED) → toujours en bas, triées par date desc
   */
  readonly filteredReservations = computed(() => {
    const filter = this.statusFilter();
    const all    = this.reservations();

    const active    = all.filter(r => r.status !== 'CANCELLED');
    const cancelled = all.filter(r => r.status === 'CANCELLED');

    let combined: ReservationItem[];

    if (filter === 'ALL') {
      combined = [...active, ...cancelled];
    } else if (filter === 'CANCELLED') {
      combined = cancelled;
    } else {
      combined = active.filter(r => r.status === filter);
    }

    return combined;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reservationsService.getMyReservations().subscribe({
      next: (items) => {
        this.reservations.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger vos réservations. Vérifiez votre connexion.');
        this.loading.set(false);
      },
    });
  }

  setFilter(filter: ReservationStatus | 'ALL'): void {
    this.statusFilter.set(filter);
  }

  confirmCancel(item: ReservationItem): void {
    const dialogRef = this.dialog.open(ReservationCancelDialogComponent, {
      data: { bookTitle: item.bookTitle },
      width: '380px',
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.doCancel(item);
      }
    });
  }

  private doCancel(item: ReservationItem): void {
    this.cancelling.set(item.id);

    this.reservationsService.cancelReservation(item.id).subscribe({
      next: () => {
        this.cancelling.set(null);
        // Mettre à jour le statut localement et réordonner les rangs
        this.reservations.update(list =>
          list
            .map(r => r.id === item.id ? { ...r, status: 'CANCELLED' as const } : r)
            .map(r => (r.status === 'PENDING' && r.bookId === item.bookId && r.rank > item.rank)
              ? { ...r, rank: r.rank - 1 }
              : r
            )
        );
        this.snackBar.open(
          `Réservation de « ${item.bookTitle} » annulée.`,
          'Fermer',
          { duration: 4000, panelClass: ['snack-success'] }
        );
      },
      error: (err) => {
        this.cancelling.set(null);
        const msg = err?.error?.detail ?? 'Une erreur est survenue. Réessayez.';
        this.snackBar.open(msg, 'Fermer', { duration: 5000, panelClass: ['snack-error'] });
      },
    });
  }

  canCancel(status: ReservationStatus): boolean {
    return status === 'PENDING' || status === 'AVAILABLE';
  }

  statusLabel(status: ReservationStatus): string {
    switch (status) {
      case 'PENDING':   return 'En attente';
      case 'AVAILABLE': return 'Disponible !';
      case 'BORROWED':  return 'Emprunté';
      case 'CANCELLED': return 'Annulée';
    }
  }

  statusIcon(status: ReservationStatus): string {
    switch (status) {
      case 'PENDING':   return 'schedule';
      case 'AVAILABLE': return 'check_circle';
      case 'BORROWED':  return 'menu_book';
      case 'CANCELLED': return 'cancel';
    }
  }

  statusClass(status: ReservationStatus): string {
    return `status-badge badge-${status.toLowerCase()}`;
  }

  formatDate(isoDate: string): string {
    return new Date(isoDate + 'T00:00:00').toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }
}
