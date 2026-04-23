import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, ReactiveFormsModule],
  template: `
    <section class="profile-page">
      <header class="profile-hero">
        <div>
          <p class="eyebrow">Mon profil</p>
          <h1>Vos informations et votre compte</h1>
          <p class="lead">Modifiez vos coordonnées, votre mot de passe et vos paramètres RGPD.</p>
        </div>

        <div class="quick-card">
          <div class="avatar">M</div>
          <div>
            <strong>Marie Dupont</strong>
            <p>Lecteur</p>
          </div>
        </div>
      </header>

      <div class="profile-grid">
        <mat-card class="main-card">
          <mat-card-header>
            <mat-card-title>Coordonnées</mat-card-title>
            <mat-card-subtitle>Mettez à jour vos informations de contact</mat-card-subtitle>
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
            <button mat-flat-button color="primary"><mat-icon>save</mat-icon> Enregistrer</button>
          </mat-card-actions>
        </mat-card>

        <div class="side-stack">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Sécurité</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Ouvrez un panneau pour changer le mot de passe.</p>
              <button mat-stroked-button (click)="openPasswordDialog()">
                <mat-icon>lock_reset</mat-icon>
                Changer le mot de passe
              </button>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>RGPD</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Gérez vos données et la suppression du compte.</p>
              <button mat-button color="warn" (click)="openDeleteDialog()">
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
        align-items: center;
        gap: 1rem;
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
      .quick-card p,
      .main-card mat-card-subtitle,
      .side-stack p {
        margin: 0.75rem 0 0;
        color: var(--bh-ink-mid);
      }

      .quick-card {
        display: flex;
        align-items: center;
        gap: 0.9rem;
        padding: 1rem 1.1rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.65);
        border: 1px solid rgba(26, 26, 26, 0.08);
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
        grid-template-columns: 1.35fr 0.65fr;
        gap: 1rem;
        align-items: start;
      }

      .main-card,
      .side-stack mat-card {
        border-radius: var(--bh-radius-md);
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

      .side-stack button {
        margin-top: 0.75rem;
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
export class ProfileComponent {
  private readonly profileService = inject(ProfileService);

  openPasswordDialog(): void {
    this.profileService.openPasswordDialog();
  }

  openDeleteDialog(): void {
    this.profileService.openDeleteDialog();
  }
}
