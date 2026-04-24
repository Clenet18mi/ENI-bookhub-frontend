import { HttpInterceptorFn } from '@angular/common/http';

// Intercepteur HTTP : s'exécute sur CHAQUE requête sortante du front
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // On récupère la session stockée dans le localStorage
  const session = localStorage.getItem('bookhub_session');

  if (session) {
    const parsed = JSON.parse(session);
    const token = parsed.accessToken;

    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(cloned);
  }

  return next(req);
};
