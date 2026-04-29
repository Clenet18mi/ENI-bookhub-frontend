import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterPageComponent } from './register-page.component';
import { AuthService } from '../auth.service';

describe('RegisterPageComponent', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['register']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: { get: () => null } },
          },
        },
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
  });

  it('detects password mismatch', () => {
    const fixture = TestBed.createComponent(RegisterPageComponent);
    fixture.componentInstance.form.patchValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'Password1!',
      confirmPassword: 'Password2!',
      acceptTerms: true,
    });

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.passwordMismatch).toBeTrue();
    expect(auth.register).not.toHaveBeenCalled();
  });
});
