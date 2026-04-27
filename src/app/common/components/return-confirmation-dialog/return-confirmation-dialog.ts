import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ReturnDialogData {
  loanId: number;
  bookTitle: string;
  userFullName: string;
}

@Component({
  selector: 'app-return-confirmation-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './return-confirmation-dialog.html',
  styleUrl: './return-confirmation-dialog.scss',
})
export class ReturnConfirmationDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) readonly data: ReturnDialogData) { }
}
