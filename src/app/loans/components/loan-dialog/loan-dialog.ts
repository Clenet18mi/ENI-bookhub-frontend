import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-loan-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    DatePipe
  ],
  templateUrl: './loan-dialog.html',
  styleUrl: './loan-dialog.scss',
})
export class LoanDialog {
  readonly form = new FormBuilder().nonNullable.group({
    startDate: [{ value: '', disabled: true }, [Validators.required]],
    endDate: [{ value: '', disabled: true }, [Validators.required]],
    acceptRules: [false, [Validators.requiredTrue]],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: any,
    private dialogRef: MatDialogRef<LoanDialog>
  ) {
    this.form.patchValue({
      startDate: data.preview.startDate,
      endDate: data.preview.endDate,
    });
  }

  get statusLabel(): string {
    switch (this.data.book.status) {
      case 'available': return 'Disponible';
      case 'loaned': return 'Emprunté';
      case 'reserved': return 'Réservé';
      default: return 'Inconnu';
    }
  }

  onConfirm(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue());
    }
  }
}