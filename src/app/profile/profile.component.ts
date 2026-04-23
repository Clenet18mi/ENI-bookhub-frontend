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
      <header class="profile-hero">
        <div>
          <p class="eyebrow">Mon profil</p>
          <h1>Vos informations personnelles</h1>
          <p class="lead">Consultez et mettez à jour vos coordonnées et préférences de compte.</p>
        </div>
      </header>

      <div class="profile-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Identité</mat-card-title>
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

        <mat-card>
          <mat-card-header>
            <mat-card-title>Sécurité</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Modifiez votre mot de passe et gérez vos options de session.</p>
            <button mat-stroked-button><mat-icon>lock_reset</mat-icon> Changer le mot de passe</button>
          </mat-card-content>
        </mat-card>
      </div>
    </section>
  `,
  styles: [
    `
      .profile-page {
        display: grid;
        gap: 1.5rem;
      }

      .profile-hero {
        padding: 1.5rem;
        border-radius: 24px;
        background: #fff;
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
        font-size: clamp(2rem, 4vw, 3rem);
      }

      .lead {
        margin: 0.75rem 0 0;
        color: var(--bh-ink-mid);
      }

      .profile-grid {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 1rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      .full {
        grid-column: 1 / -1;
      }

      mat-card-content p {
        color: var(--bh-ink-mid);
      }

      mat-card-actions,
      mat-card-content button {
        margin: 1rem;
      }

      @media (max-width: 960px) {
        .profile-grid,
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
