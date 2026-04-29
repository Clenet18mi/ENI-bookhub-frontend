import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ValidateDialogData {
  loanId: number;
  bookTitle: string;
  userFullName: string;
}

@Component({
  selector: 'app-validate-confirmation-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './validate-confirmation-dialog.html',
  styleUrl: './validate-confirmation-dialog.scss',
})
export class ValidateConfirmationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) readonly data: ValidateDialogData) {}
}
