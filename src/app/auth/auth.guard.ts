import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  if (authService.hasValidSession()) {
    return true;
  }

  authService.clearSession();
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
