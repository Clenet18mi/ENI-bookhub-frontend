import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatDividerModule, MatIconModule],
  template: `
    <section class="profile-page">
      <header class="profile-hero">
        <div>
          <p class="eyebrow">Mon compte</p>
          <h1>Votre profil BookHub.</h1>
          <p>Retrouvez vos informations, votre sécurité et vos paramètres de confidentialité au même endroit.</p>
        </div>
        <button mat-flat-button color="primary" type="button"><mat-icon>edit</mat-icon> Modifier le profil</button>
      </header>

      <section class="profile-grid">
        <mat-card class="profile-card">
          <div class="card-head">
            <mat-icon>badge</mat-icon>
            <h2>Informations</h2>
          </div>
          <div class="info-list">
            <div><span>Prénom</span><strong>Demo</strong></div>
            <div><span>Nom</span><strong>Lecteur</strong></div>
            <div><span>Email</span><strong>dev@bookhub.local</strong></div>
          </div>
        </mat-card>

        <mat-card class="profile-card">
          <div class="card-head">
            <mat-icon>lock</mat-icon>
            <h2>Sécurité</h2>
          </div>
          <p>Gérez ici les informations liées à l'accès au compte et aux préférences de connexion.</p>
          <div class="action-list">
            <button mat-stroked-button type="button" (click)="openPasswordDialog()">Changer le mot de passe</button>
            <button mat-stroked-button type="button" (click)="openDeleteDialog()">Déconnexion sur tous les appareils</button>
          </div>
        </mat-card>

        <mat-card class="profile-card profile-card-wide">
          <div class="card-head">
            <mat-icon>shield</mat-icon>
            <h2>Confidentialité</h2>
          </div>
          <p>Les réglages RGPD et la suppression de données seront détaillés ici dans la suite du parcours.</p>
          <mat-divider></mat-divider>
          <div class="privacy-grid">
            <div>
              <strong>Consentements</strong>
              <span>Historique des choix utilisateur</span>
            </div>
            <div>
              <strong>Données personnelles</strong>
              <span>Export et gestion des informations</span>
            </div>
          </div>
        </mat-card>
      </section>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .profile-page { display: grid; gap: 1rem; }
      .profile-hero { display: flex; justify-content: space-between; gap: 1rem; align-items: end; padding: 1.5rem; border-radius: 24px; background: linear-gradient(135deg, rgba(184,92,0,.1), rgba(31,77,58,.08)), #fff; border: 1px solid rgba(26,26,26,.06); }
      .eyebrow { margin: 0 0 .35rem; text-transform: uppercase; letter-spacing: .12em; font-size: .78rem; color: var(--bh-forest-mid); }
      h1 { margin: 0; font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(2rem, 4vw, 3.2rem); }
      .profile-hero p { margin: .5rem 0 0; color: var(--bh-ink-mid); max-width: 58ch; line-height: 1.6; }
      .profile-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
      .profile-card { padding: 1.25rem; border-radius: 24px; display: grid; gap: .9rem; }
      .profile-card-wide { grid-column: 1 / -1; }
      .card-head { display: flex; align-items: center; gap: .75rem; }
      .card-head h2 { margin: 0; font-family: 'DM Serif Display', Georgia, serif; }
      .card-head mat-icon { color: var(--bh-forest); }
      .info-list { display: grid; gap: .75rem; }
      .info-list div, .privacy-grid div { display: grid; gap: .1rem; padding: .85rem 1rem; border-radius: 16px; background: rgba(31,77,58,.05); }
      .info-list span, .privacy-grid span, .profile-card p { color: var(--bh-ink-mid); }
      .action-list { display: flex; flex-wrap: wrap; gap: .75rem; }
      .privacy-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
      @media (max-width: 960px) { .profile-hero, .profile-grid { display: grid; } }
      @media (max-width: 640px) { .profile-hero { padding: 1rem; } .profile-grid, .privacy-grid { grid-template-columns: 1fr; } .profile-card { padding: 1rem; } }
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
