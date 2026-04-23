import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <section class="profile-page">
      <header class="hero">
        <div>
          <p class="eyebrow">Profil</p>
          <h1>Vos informations personnelles</h1>
          <p class="lead">Gérez vos coordonnées et vos préférences dans un espace clair et responsive.</p>
        </div>
      </header>

      <div class="grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Coordonnées</mat-card-title>
            <mat-card-subtitle>Mettez à jour votre compte</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Prénom</mat-label>
              <input matInput value="Marie" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Nom</mat-label>
              <input matInput value="Dupont" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Email</mat-label>
              <input matInput value="marie.dupont@bookhub.fr" />
            </mat-form-field>
          </mat-card-content>
          <mat-card-actions>
            <button mat-flat-button color="primary"><mat-icon>save</mat-icon> Enregistrer</button>
          </mat-card-actions>
        </mat-card>

        <div class="stack">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Sécurité</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Modifiez votre mot de passe quand nécessaire.</p>
              <button mat-stroked-button><mat-icon>lock_reset</mat-icon> Changer le mot de passe</button>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>RGPD</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Vous pouvez supprimer votre compte à tout moment.</p>
              <button mat-button color="warn"><mat-icon>person_remove</mat-icon> Supprimer mon compte</button>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .profile-page {
        display: grid;
        gap: 1.25rem;
      }

      .hero {
        padding: 1.5rem;
        border-radius: var(--bh-radius-lg);
        background: linear-gradient(135deg, rgba(31, 77, 58, 0.1), rgba(184, 92, 0, 0.08)), #fff;
        border: 1px solid rgba(26, 26, 26, 0.06);
      }

      .eyebrow {
        margin: 0 0 0.35rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.78rem;
        color: var(--bh-forest-mid);
      }

      h1 {
        margin: 0;
        font-family: 'DM Serif Display', Georgia, serif;
        font-size: clamp(2rem, 4vw, 3.2rem);
      }

      .lead,
      mat-card-content p,
      mat-card-subtitle {
        color: var(--bh-ink-mid);
      }

      .grid {
        display: grid;
        grid-template-columns: 1.3fr 0.7fr;
        gap: 1rem;
        align-items: start;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      .full {
        grid-column: 1 / -1;
      }

      .stack {
        display: grid;
        gap: 1rem;
      }

      mat-card-actions,
      mat-card-content {
        padding: 1rem;
      }

      mat-card-actions button mat-icon,
      mat-card-content button mat-icon {
        margin-right: 0.5rem;
      }

      @media (max-width: 960px) {
        .grid,
        .form-grid {
          grid-template-columns: 1fr;
        }

        .full {
          grid-column: auto;
        }
      }
    `,
  ],
})
export class ProfileComponent {}
