import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

export interface ProfileDialogData {
  title: string;
  description: string;
  action: string;
}

@Component({
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.description }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button mat-dialog-close color="primary">{{ data.action }}</button>
    </mat-dialog-actions>
  `,
})
export class ProfileDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) readonly data: ProfileDialogData) {}
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private readonly dialog: MatDialog) {}

  openPasswordDialog(): void {
    this.dialog.open(ProfileDialogComponent, {
      data: {
        title: 'Changer le mot de passe',
        description: 'Formulaire à brancher plus tard sur le backend.',
        action: 'Compris',
      },
    });
  }

  openDeleteDialog(): void {
    this.dialog.open(ProfileDialogComponent, {
      data: {
        title: 'Supprimer le compte',
        description: 'Étape de confirmation RGPD à brancher plus tard.',
        action: 'Fermer',
      },
    });
  }
}
