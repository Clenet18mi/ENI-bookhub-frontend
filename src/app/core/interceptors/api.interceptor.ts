import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environnments/environment';
import { AuthService } from '../../auth/auth.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Préfixe l'URL avec l'API base
  let headers = req.headers.set('Content-Type', 'application/json');

  // Attache le JWT si présent
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const apiReq = req.clone({
    url: `${environment.apiUrl}/${req.url}`,
    headers,
  });

  return next(apiReq);
};
