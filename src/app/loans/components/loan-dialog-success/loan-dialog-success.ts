import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { LoanRecord } from '../../models/loan-success.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-loan-dialog-success',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, DatePipe],
  templateUrl: './loan-dialog-success.html',
  styleUrl: './loan-dialog-success.scss',
})
export class LoanDialogSuccess {
  constructor(@Inject(MAT_DIALOG_DATA) readonly data: LoanRecord) { }
}
