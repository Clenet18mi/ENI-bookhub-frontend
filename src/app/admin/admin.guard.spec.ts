import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../auth/auth.service';
import { ProfileService } from '../profile/profile.service';

describe('adminGuard', () => {
  const loginTree = { url: '/login' } as never;
  const dashboardTree = { url: '/dashboard' } as never;
  const router = { createUrlTree: jasmine.createSpy('createUrlTree').and.callFake((args: string[]) => {
    if (args[0] === '/login') return loginTree;
    return dashboardTree;
  }) };
  const auth = { hasValidSession: jasmine.createSpy('hasValidSession') };
  const profile = {
    currentProfile: jasmine.createSpy('currentProfile'),
    getProfile: jasmine.createSpy('getProfile'),
  };

  beforeEach(() => {
    router.createUrlTree.calls.reset();
    auth.hasValidSession.calls.reset();
    profile.currentProfile.calls.reset();
    profile.getProfile.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: auth },
        { provide: ProfileService, useValue: profile },
      ],
    });
  });

  it('redirects to login when not authenticated', async () => {
    auth.hasValidSession.and.returnValue(false);

    const result = await TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));

    expect(profile.getProfile).not.toHaveBeenCalled();
    expect(result as never).toBe(loginTree);
  });

  it('allows admin access when profile is admin', async () => {
    auth.hasValidSession.and.returnValue(true);
    profile.currentProfile.and.returnValue({ role: 'ROLE_ADMIN' });

    const result = await TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));

    expect(result).toBeTrue();
  });

  it('redirects to dashboard when role is insufficient', async () => {
    auth.hasValidSession.and.returnValue(true);
    profile.currentProfile.and.returnValue({ role: 'ROLE_USER' });

    const result = await TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));

    expect(result as never).toBe(dashboardTree);
  });
});
