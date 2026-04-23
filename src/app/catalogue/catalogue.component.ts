import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <section class="placeholder-page">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Catalogue</mat-card-title>
          <mat-card-subtitle>Interface responsive pour rechercher et filtrer les livres.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Cette page servira de grille de livres, filtres et pagination.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-flat-button color="primary"><mat-icon>search</mat-icon> Rechercher</button>
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
export class CatalogueComponent {}
