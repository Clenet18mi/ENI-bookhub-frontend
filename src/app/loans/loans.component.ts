import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <section class="placeholder-page">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Mes emprunts</mat-card-title>
          <mat-card-subtitle>Historique, retours et alertes de retard.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Cette vue accueillera les onglets emprunts en cours et historique.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-flat-button color="primary"><mat-icon>history</mat-icon> Voir l'historique</button>
        </mat-card-actions>
      </mat-card>
    </section>
  `,
  styles: [
    `
      .placeholder-page {
        min-height: 40vh;
        display: grid;
        place-items: start;
      }

      mat-card {
        width: min(100%, 720px);
      }
    `,
  ],
})
export class LoansComponent {}
