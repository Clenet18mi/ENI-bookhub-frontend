import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-delete-book-success-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatIconModule],
    templateUrl: './delete-book-dialog-success.html',
    styleUrl: './delete-book-dialog-success.scss',
})
export class DeleteBookSuccessDialog {
    constructor(@Inject(MAT_DIALOG_DATA) readonly data: { title: string }) { }
}