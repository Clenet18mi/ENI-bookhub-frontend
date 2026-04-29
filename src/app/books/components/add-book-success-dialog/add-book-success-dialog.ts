import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookDTO } from '../../book.service';

@Component({
  selector: 'app-add-book-success-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './add-book-success-dialog.html',
  styleUrl: './add-book-success-dialog.scss'
})
export class AddBookSuccessDialogComponent {
  readonly data = inject<{ book: BookDTO }>(MAT_DIALOG_DATA);
}