import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReservationBookSummary, ReservationPreview } from './reservation.service';

export interface ReservationDialogData {
  book: ReservationBookSummary;
  preview: ReservationPreview;
}

@Component({
  selector: 'app-reservation-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './reservation-dialog.component.html',
  styleUrl: './reservation-dialog.component.scss',
})
export class ReservationDialogComponent {
  readonly form = new FormBuilder().nonNullable.group({
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    acceptRules: [false, [Validators.requiredTrue]],
  });

  constructor(@Inject(MAT_DIALOG_DATA) readonly data: ReservationDialogData) {
    this.form.setValue({
      startDate: data.preview.requestedStartDate,
      endDate: data.preview.requestedEndDate,
      acceptRules: false,
    });
  }

  get statusLabel(): string {
    switch (this.data.book.status) {
      case 'available': return 'Disponible';
      case 'loaned': return 'Emprunté';
      case 'reserved': return 'Réservé';
    }
  }
}
