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
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
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
