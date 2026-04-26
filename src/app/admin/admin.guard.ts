import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProfileService } from '../profile/profile.service';
import { AuthService } from '../auth/auth.service';

/**
 * Guard qui protège les routes /admin.
 *
 * Règle : l'utilisateur doit être connecté ET avoir le rôle ROLE_ADMIN
 * dans son profil (chargé depuis le backend).
 *
 * Si le profil n'est pas encore en cache, on le charge.
 * En cas d'erreur ou de rôle insuffisant → redirection vers /dashboard.
 */
export const adminGuard: CanActivateFn = async () => {
  const authService    = inject(AuthService);
  const profileService = inject(ProfileService);
  const router         = inject(Router);

  // 1. Doit être connecté
  if (!authService.hasValidSession()) {
    return router.createUrlTree(['/login']);
  }

  // 2. Récupérer le profil (depuis le cache signal ou le backend)
  let profile = profileService.currentProfile();

  if (!profile) {
    try {
      profile = await new Promise((resolve, reject) => {
        profileService.getProfile().subscribe({ next: resolve, error: reject });
      });
      profileService.currentProfile.set(profile);
    } catch {
      return router.createUrlTree(['/login']);
    }
  }

  // 3. Vérifier le rôle ADMIN
  if (profile?.role === 'ROLE_ADMIN') {
    return true;
  }

  // Accès refusé → renvoyer sur le dashboard sans exposer la route
  return router.createUrlTree(['/dashboard']);
};
