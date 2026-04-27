import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService, UserProfile } from './profile.service';
import { AuthService } from '../auth/auth.service';

/** Formate le libellé du rôle pour l'affichage */
function formatRole(role: string): string {
  const map: Record<string, string> = {
    ROLE_USER: 'Lecteur',
    ROLE_LIBRARIAN: 'Bibliothécaire',
    ROLE_ADMIN: 'Administrateur',
  };
  return map[role] ?? role;
}

/** Retourne l'initiale pour l'avatar */
function initiale(profile: UserProfile): string {
  return (profile.firstName?.[0] ?? profile.email?.[0] ?? '?').toUpperCase();
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <!-- Chargement initial -->
    <div *ngIf="loading()" class="loading-center">
      <mat-spinner diameter="48"></mat-spinner>
    </div>

    <!-- Erreur de chargement -->
    <div *ngIf="!loading() && loadError()" class="error-banner">
      <mat-icon>error_outline</mat-icon>
      <span>Impossible de charger le profil. Vérifiez votre connexion.</span>
    </div>

    <!-- Page profil -->
    <section class="profile-page" *ngIf="!loading() && profile()">
      <!-- En-tête -->
      <header class="profile-hero">
        <div>
          <p class="eyebrow">Mon profil</p>
          <h1>Vos informations et votre compte</h1>
          <p class="lead">Modifiez vos coordonnées et votre mot de passe.</p>
        </div>

        <div class="quick-card">
          <div class="avatar">{{ initiale(profile()!) }}</div>
          <div>
            <strong>{{ profile()!.firstName }} {{ profile()!.lastName }}</strong>
            <p>{{ formatRole(profile()!.role) }}</p>
            <p class="member-since">Membre depuis {{ profile()!.createdAt | date:'MMMM yyyy' : '' : 'fr' }}</p>
          </div>
        </div>
      </header>

      <div class="profile-grid">
        <!-- Coordonnées -->
        <mat-card class="main-card">
          <mat-card-header>
            <mat-card-title>Coordonnées</mat-card-title>
            <mat-card-subtitle>Mettez à jour vos informations de contact</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Prénom</mat-label>
              <input matInput [formControl]="profileForm.controls.firstName" />
              <mat-error *ngIf="profileForm.controls.firstName.hasError('required')">
                Champ requis
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nom</mat-label>
              <input matInput [formControl]="profileForm.controls.lastName" />
              <mat-error *ngIf="profileForm.controls.lastName.hasError('required')">
                Champ requis
              </mat-error>
            </mat-form-field>

            <!-- Email en lecture seule -->
            <mat-form-field appearance="outline" class="full">
              <mat-label>Email</mat-label>
              <input matInput [value]="profile()!.email" readonly />
              <mat-icon matSuffix>lock</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Téléphone</mat-label>
              <input matInput [formControl]="profileForm.controls.phone" placeholder="06 12 34 56 78" />
            </mat-form-field>
          </mat-card-content>

          <mat-card-actions>
            <button
              mat-flat-button
              color="primary"
              [disabled]="profileForm.invalid || savingProfile()"
              (click)="onUpdateProfile()">
              <mat-icon>save</mat-icon>
              {{ savingProfile() ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Colonne droite -->
        <div class="side-stack">
          <!-- Sécurité -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Sécurité</mat-card-title>
              <mat-card-subtitle>Changez votre mot de passe</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <div *ngIf="!showPasswordForm()" class="password-intro">
                <p>Votre mot de passe est sécurisé et chiffré.</p>
                <button mat-stroked-button (click)="showPasswordForm.set(true)">
                  <mat-icon>lock_reset</mat-icon>
                  Changer le mot de passe
                </button>
              </div>

              <div *ngIf="showPasswordForm()">
                <mat-form-field appearance="outline" class="full-field">
                  <mat-label>Mot de passe actuel</mat-label>
                  <input matInput type="password" [formControl]="passwordForm.controls.currentPassword" />
                  <mat-error *ngIf="passwordForm.controls.currentPassword.hasError('required')">
                    Champ requis
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-field">
                  <mat-label>Nouveau mot de passe</mat-label>
                  <input matInput type="password" [formControl]="passwordForm.controls.newPassword" />
                  <mat-error *ngIf="passwordForm.controls.newPassword.hasError('minlength')">
                    8 caractères minimum
                  </mat-error>
                </mat-form-field>

                <div class="password-actions">
                  <button mat-button (click)="showPasswordForm.set(false); passwordForm.reset()">
                    Annuler
                  </button>
                  <button
                    mat-flat-button
                    color="primary"
                    [disabled]="passwordForm.invalid || savingPassword()"
                    (click)="onChangePassword()">
                    {{ savingPassword() ? 'Modification…' : 'Confirmer' }}
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Infos compte -->
          <mat-card class="account-info-card">
            <mat-card-header>
              <mat-card-title>Informations compte</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p><strong>Rôle :</strong> {{ formatRole(profile()!.role) }}</p>
              <p><strong>Inscrit le :</strong> {{ profile()!.createdAt | date:'dd/MM/yyyy' }}</p>
              <p *ngIf="profile()!.updatedAt">
                <strong>Dernière mise à jour :</strong> {{ profile()!.updatedAt | date:'dd/MM/yyyy' }}
              </p>
            </mat-card-content>
          </mat-card>

          <!-- Zone danger : suppression de compte -->
          <mat-card class="danger-zone-card">
            <mat-card-header>
              <mat-icon class="danger-icon">warning</mat-icon>
              <mat-card-title>Zone de danger</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="danger-desc">
                La suppression de votre compte est irréversible. Toutes vos données seront anonymisées.
              </p>
              <p class="danger-desc warn-reservations" *ngIf="deletionBlocked()">
                <mat-icon>block</mat-icon>
                Vous avez des emprunts ou réservations en cours. Retournez vos livres et annulez vos réservations avant de supprimer votre compte.
              </p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-stroked-button color="warn" (click)="onDeleteAccount()" [disabled]="deletingAccount()">
                <mat-icon>delete_forever</mat-icon>
                Supprimer mon compte
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .loading-center {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: #fff3f3;
      border: 1px solid #f5c2c2;
      border-radius: 8px;
      color: #c0392b;
    }

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
      border-radius: var(--bh-radius-lg, 16px);
      background: linear-gradient(135deg, rgba(31, 77, 58, 0.1), rgba(184, 92, 0, 0.08)), #fff;
      border: 1px solid rgba(26, 26, 26, 0.06);
    }

    .eyebrow {
      margin: 0 0 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.78rem;
      color: var(--bh-forest-mid, #2d6a4f);
    }

    h1 {
      margin: 0;
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: clamp(1.8rem, 4vw, 3.2rem);
    }

    .lead, .quick-card p {
      margin: 0.5rem 0 0;
      color: var(--bh-ink-mid, #555);
    }

    .member-since {
      font-size: 0.8rem;
      color: var(--bh-ink-mid, #888);
    }

    .quick-card {
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
      background: var(--bh-forest, #1f4d3a);
      color: #fff;
      font-weight: 700;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1.35fr 0.65fr;
      gap: 1rem;
      align-items: start;
    }

    .main-card, .side-stack mat-card {
      border-radius: var(--bh-radius-md, 12px);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
      padding: 1rem;
    }

    .full {
      grid-column: 1 / -1;
    }

    .full-field {
      width: 100%;
      display: block;
      margin-bottom: 0.5rem;
    }

    .side-stack {
      display: grid;
      gap: 1rem;
    }

    .password-intro p {
      margin: 0 0 0.75rem;
      color: var(--bh-ink-mid, #555);
    }

    .password-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 0.5rem;
    }

    .danger-zone-card {
      border: 1px solid #fca5a5 !important;
      background: #fff7f7 !important;
    }
    .danger-zone-card mat-card-header {
      display: flex;
      align-items: center;
      gap: .5rem;
    }
    .danger-icon { color: #ef4444; margin-right: .5rem; }
    .danger-desc { color: #64748b; font-size: .9rem; margin: .5rem 0; }
    .warn-reservations {
      display: flex;
      align-items: center;
      gap: .4rem;
      color: #b91c1c !important;
      font-weight: 600;
    }
    .warn-reservations mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    .account-info-card mat-card-content p {
      margin: 0.35rem 0;
      font-size: 0.9rem;
      color: #444;
    }

    mat-card-actions {
      padding: 0.75rem 1rem 1rem;
    }

    mat-card-content {
      padding: 1rem;
    }

    mat-card-actions button mat-icon,
    mat-card-content button mat-icon {
      margin-right: 0.4rem;
    }

    @media (max-width: 960px) {
      .profile-hero {
        flex-direction: column;
        align-items: flex-start;
      }

      .profile-grid {
        grid-template-columns: 1fr;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .full {
        grid-column: auto;
      }
    }
  `],
})
export class ProfileComponent implements OnInit {

  // Exposer les fonctions utilitaires au template
  readonly formatRole = formatRole;
  readonly initiale = initiale;

  // Signals pour l'état
  readonly profile    = signal<UserProfile | null>(null);
  readonly loading    = signal(true);
  readonly loadError  = signal(false);
  readonly savingProfile  = signal(false);
  readonly savingPassword = signal(false);
  readonly showPasswordForm = signal(false);

  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly deletionBlocked = signal(false);
  readonly deletingAccount = signal(false);
  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    phone:     [''],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
  });

ngOnInit(): void {
  this.profileService.getProfile().subscribe({
    next: (data) => {
      this.profile.set(data);
      this.loading.set(false);
      setTimeout(() => {
        this.profileForm.patchValue({
          firstName: data.firstName ?? '',
          lastName:  data.lastName ?? '',
          phone:     data.phone ?? '',
        });
      });
    },
    error: () => {
      this.loading.set(false);
      this.loadError.set(true);
    },
  });
}

  onUpdateProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile.set(true);

    this.profileService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.savingProfile.set(false);
        this.snackBar.open('Profil mis à jour ✓', 'Fermer', { duration: 3000 });
      },
      error: () => {
        this.savingProfile.set(false);
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', {
          duration: 4000,
          panelClass: 'snack-error',
        });
      },
    });
  }

  onDeleteAccount(): void {
    // Vérifier d'abord les réservations actives
    this.profileService.hasActiveReservations().subscribe({
      next: ({ hasActive }) => {
        if (hasActive) {
          this.deletionBlocked.set(true);
          this.snackBar.open(
            'Impossible de supprimer votre compte : vous avez des emprunts ou réservations en cours.',
            'Fermer',
            { duration: 6000, panelClass: 'snack-error' }
          );
          return;
        }
        // Pas de blocage → demander confirmation
        const confirmed = window.confirm(
          'Êtes-vous sûr de vouloir supprimer votre compte ?\n\n' +
          'Vos données personnelles seront anonymisées conformément au RGPD. ' +
          'Cette action est irréversible.'
        );
        if (!confirmed) return;

        this.deletingAccount.set(true);
        this.profileService.deleteAccount().subscribe({
          next: () => {
            // Effacer toutes les données de session côté client
            this.authService.resetClientState();
            // Rediriger vers /login avec le flag deleted=true pour afficher la notification
            this.router.navigate(['/login'], { queryParams: { deleted: 'true' } });
          },
          error: (err) => {
            this.deletingAccount.set(false);
            const msg = err?.error?.message ?? 'Erreur lors de la suppression du compte.';
            this.snackBar.open(msg, 'Fermer', { duration: 6000, panelClass: 'snack-error' });
          },
        });
      },
      error: () => {
        this.snackBar.open('Impossible de vérifier vos réservations.', 'Fermer', { duration: 4000 });
      },
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) return;
    this.savingPassword.set(true);

    this.profileService.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.showPasswordForm.set(false);
        this.passwordForm.reset();
        this.snackBar.open('Mot de passe modifié ✓', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        this.savingPassword.set(false);
        const msg = err.status === 400
          ? 'Mot de passe actuel incorrect'
          : 'Erreur lors du changement de mot de passe';
        this.snackBar.open(msg, 'Fermer', {
          duration: 4000,
          panelClass: 'snack-error',
        });
      },
    });
  }
}
