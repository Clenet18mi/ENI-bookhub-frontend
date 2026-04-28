import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReservationRecord } from './reservation.service';

@Component({
  selector: 'app-reservation-success-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './reservation-success-dialog.component.html',
  styleUrl: './reservation-success-dialog.component.scss',
})
export class ReservationSuccessDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) readonly data: ReservationRecord) {}
}
