import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface DialogData {
  bookTitle: string;
}

/**
 * Dialog de confirmation avant annulation d'une réservation.
 * Retourne true (confirmé) ou false/undefined (annulé).
 */
@Component({
  selector: 'app-reservation-cancel-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './reservation-cancel-dialog.component.html',
  styleUrl: './reservation-cancel-dialog.component.scss',
})
export class ReservationCancelDialogComponent {
  readonly data     = inject<DialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ReservationCancelDialogComponent>);

  close(confirmed: boolean): void {
    this.dialogRef.close(confirmed);
  }
}
