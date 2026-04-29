import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-update-book-dialog-success',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './update-book-dialog-success.html',
  styleUrl: './update-book-dialog-success.scss'
})
export class UpdateBookDialogSuccess {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string }) { }
}