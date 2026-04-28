import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
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
 *  - statut (WAITING / AVAILABLE / BORROWED / CANCELED)
 *  - bouton d'annulation conditionnel (WAITING | AVAILABLE uniquement)
 */
@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    MatButtonModule,
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

  readonly activeCount    = computed(() => this.reservations().filter(r => r.status === 'PENDING').length);
  readonly availableCount = computed(() => this.reservations().filter(r => r.status === 'AVAILABLE').length);

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
        // Retirer la réservation de la liste et mettre à jour les rangs localement
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
      case 'CANCELLED':  return 'Annulée';
    }
  }

  statusIcon(status: ReservationStatus): string {
    switch (status) {
      case 'PENDING':   return 'schedule';
      case 'AVAILABLE': return 'check_circle';
      case 'BORROWED':  return 'menu_book';
      case 'CANCELLED':  return 'cancel';
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
