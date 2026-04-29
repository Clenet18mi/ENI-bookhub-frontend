import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Book } from '../../../core/models/book.model';

@Component({
    selector: 'app-delete-book-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatIconModule],
    templateUrl: './delete-book-dialog.html',
    styleUrl: './delete-book-dialog.scss',
})
export class DeleteBookDialog {
    constructor(
        @Inject(MAT_DIALOG_DATA) readonly book: Book,
        private dialogRef: MatDialogRef<DeleteBookDialog>
    ) { }

    onConfirm(): void {
        this.dialogRef.close(true);
    }
}