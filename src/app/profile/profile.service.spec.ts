import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ProfileService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the current profile into the signal', () => {
    service.getProfile().subscribe();
    const req = httpMock.expectOne('users/me');
    req.flush({ id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: null, role: 'ROLE_USER', createdAt: '2026-01-01', updatedAt: null });

    expect(service.currentProfile()?.firstName).toBe('Ada');
  });

  it('updates the profile', () => {
    service.updateProfile({ firstName: 'Ada' }).subscribe();
    const req = httpMock.expectOne('users/me');
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 1, firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: null, role: 'ROLE_USER', createdAt: '2026-01-01', updatedAt: null });
  });

  it('changes password', () => {
    service.changePassword({ currentPassword: 'old', newPassword: 'Newpass1!' }).subscribe();
    const req = httpMock.expectOne('users/me/password');
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });

  it('checks active reservations', () => {
    service.hasActiveReservations().subscribe();
    const req = httpMock.expectOne('users/me/has-active-reservations');
    expect(req.request.method).toBe('GET');
    req.flush({ hasActive: true });
  });

  it('deletes account', () => {
    service.deleteAccount().subscribe();
    const req = httpMock.expectOne('users/me');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
