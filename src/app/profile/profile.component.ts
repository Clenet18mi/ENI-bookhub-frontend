import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <section class="profile-page">
      <header class="profile-hero">
        <div>
          <p class="eyebrow">Profil utilisateur</p>
          <h1>Mon espace personnel</h1>
          <p class="lead">Gérez vos informations, votre sécurité et vos préférences de compte.</p>
        </div>
        <div class="avatar-card">
          <div class="avatar">M</div>
          <div>
            <strong>Marie Dupont</strong>
            <p>Lecteur</p>
          </div>
        </div>
      </header>

      <div class="profile-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Informations personnelles</mat-card-title>
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

            <mat-form-field appearance="outline" class="full">
              <mat-label>Téléphone</mat-label>
              <input matInput value="06 12 34 56 78" />
            </mat-form-field>
          </mat-card-content>

          <mat-card-actions>
            <button mat-flat-button color="primary">
              <mat-icon>save</mat-icon>
              Enregistrer
            </button>
          </mat-card-actions>
        </mat-card>

        <div class="side-stack">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Sécurité</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Gardez un mot de passe fort et changez-le régulièrement.</p>
              <button mat-stroked-button>
                <mat-icon>lock_reset</mat-icon>
                Changer le mot de passe
              </button>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Compte</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Vous pouvez supprimer votre compte selon vos droits RGPD.</p>
              <button mat-button color="warn">
                <mat-icon>person_remove</mat-icon>
                Supprimer mon compte
              </button>
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
        gap: 1.5rem;
      }

      .profile-hero {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
        padding: 1.5rem;
        border-radius: 24px;
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
      .profile-grid mat-card-content p,
      .avatar-card p {
        margin: 0.75rem 0 0;
        color: var(--bh-ink-mid);
      }

      .avatar-card {
        display: flex;
        align-items: center;
        gap: 0.9rem;
        padding: 1rem 1.1rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.65);
        border: 1px solid rgba(26, 26, 26, 0.08);
        white-space: nowrap;
      }

      .avatar {
        width: 3rem;
        height: 3rem;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: var(--bh-forest);
        color: #fff;
        font-weight: 700;
      }

      .profile-grid {
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

      .side-stack {
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
        .profile-hero,
        .profile-grid,
        .form-grid {
          grid-template-columns: 1fr;
        }

        .profile-hero {
          display: grid;
          justify-content: initial;
        }

        .full {
          grid-column: auto;
        }
      }
    `,
  ],
})
export class ProfileComponent {}
