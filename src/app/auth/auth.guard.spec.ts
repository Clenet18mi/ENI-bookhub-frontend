import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  const tree = { url: '/login' } as never;
  const router = { createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue(tree) };
  const auth = {
    hasValidSession: jasmine.createSpy('hasValidSession'),
    clearSession: jasmine.createSpy('clearSession'),
  };

  beforeEach(() => {
    router.createUrlTree.calls.reset();
    auth.hasValidSession.calls.reset();
    auth.clearSession.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: auth },
      ],
    });
  });

  it('allows access when session is valid', () => {
    auth.hasValidSession.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard(null as never, { url: '/dashboard' } as RouterStateSnapshot));

    expect(result).toBeTrue();
    expect(auth.clearSession).not.toHaveBeenCalled();
  });

  it('redirects to login when session is missing', () => {
    auth.hasValidSession.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard(null as never, { url: '/admin' } as RouterStateSnapshot));

    expect(auth.clearSession).toHaveBeenCalled();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/admin' } });
    expect(result as never).toBe(tree);
  });
});
