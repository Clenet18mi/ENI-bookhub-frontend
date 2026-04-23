import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReservationRecord } from './reservation.service';

@Component({
  selector: 'app-reservation-success-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Réservation confirmée</h2>
    <mat-dialog-content class="content">
      <div class="success-badge"><mat-icon>check_circle</mat-icon></div>
      <p><strong>{{ data.bookTitle }}</strong> a été ajouté à vos réservations.</p>
      <p>Rang estimé : #{{ data.rank }}</p>
      <p>Période : {{ data.effectiveStartDate }} → {{ data.effectiveEndDate }}</p>
      <p>Référence : {{ data.reservationId }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .content { display: grid; gap: .35rem; min-width: min(92vw, 420px); }
      .success-badge { width: 3rem; height: 3rem; border-radius: 999px; display: grid; place-items: center; background: var(--bh-forest-pale); color: var(--bh-forest); }
      p { margin: 0; color: var(--bh-ink-mid); }
    `,
  ],
})
export class ReservationSuccessDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) readonly data: ReservationRecord) {}
}
