import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { ProfileService } from './profile.service';
import { AuthService } from '../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

describe('ProfileComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        {
          provide: ProfileService,
          useValue: {
            getProfile: () => of({ id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: null, role: 'ROLE_USER', createdAt: '2026-01-01', updatedAt: null }),
            updateProfile: () => of({ id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: null, role: 'ROLE_USER', createdAt: '2026-01-01', updatedAt: null }),
            hasActiveReservations: () => of({ hasActive: false }),
            deleteAccount: () => of(void 0),
            changePassword: () => of(void 0),
          },
        },
        { provide: AuthService, useValue: { resetClientState: jasmine.createSpy('resetClientState') } },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        { provide: MatDialog, useValue: {} },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).compileComponents();
  });

  it('formats initials and roles', () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    expect(fixture.componentInstance.initiale({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', role: 'ROLE_USER', id: 1, phone: null, createdAt: '2026-01-01', updatedAt: null })).toBe('A');
    expect(fixture.componentInstance.formatRole('ROLE_ADMIN')).toBe('Administrateur');
  });
});
