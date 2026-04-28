import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('saves a session after login', () => {
    service.login({ email: 'john.doe@example.com', password: 'Password1!' }).subscribe();

    const req = httpMock.expectOne('auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'jwt', email: 'john.doe@example.com', role: 'ROLE_USER' });

    const session = service.getSession();
    expect(session?.accessToken).toBe('jwt');
    expect(session?.user.firstName).toBe('John');
    expect(service.getToken()).toBe('jwt');
    expect(service.getRole()).toBe('ROLE_USER');
  });

  it('returns null for expired sessions', () => {
    service.saveSession({
      accessToken: 'expired',
      expiresAt: '2000-01-01T00:00:00.000Z',
      user: { firstName: 'A', lastName: '', email: 'a@b.com', role: 'ROLE_USER' },
    });

    expect(service.getSession()).toBeNull();
    expect(localStorage.getItem('bookhub_session')).toBeNull();
  });

  it('clears prefixed state on reset', () => {
    localStorage.setItem('bookhub_session', 'x');
    localStorage.setItem('bookhub_other', 'y');
    localStorage.setItem('unrelated', 'z');

    service.resetClientState();

    expect(localStorage.getItem('bookhub_session')).toBeNull();
    expect(localStorage.getItem('bookhub_other')).toBeNull();
    expect(localStorage.getItem('unrelated')).toBe('z');
  });
});
