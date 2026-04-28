import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../auth/auth.service';
import { ProfileService } from '../profile/profile.service';

describe('adminGuard', () => {
  const tree = { url: '/login' } as never;
  const router = { createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue(tree) };
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
    expect(result as never).toBe(tree);
  });
});
