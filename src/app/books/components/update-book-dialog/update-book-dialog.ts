import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TextFieldModule } from '@angular/cdk/text-field';
import { Book } from '../../../core/models/book.model';

@Component({
  selector: 'app-update-book-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TextFieldModule
  ],
  templateUrl: './update-book-dialog.html',
  styleUrl: './update-book-dialog.scss'
})
export class UpdateBookDialog implements OnInit {
  bookForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UpdateBookDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Book
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      category: ['', Validators.required],
      isbn: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      totalCopies: [0, [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.bookForm.patchValue(this.data);
    }
  }

  onConfirm(): void {
    if (this.bookForm.valid) {
      this.dialogRef.close({ ...this.data, ...this.bookForm.value });
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onNumberOnly(event: KeyboardEvent): void {
    const charCode = event.key;
    if (isNaN(Number(charCode)) && event.key !== 'Backspace' && event.key !== 'Tab') {
      event.preventDefault();
    }
  }
}