import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginPageComponent } from './login-page.component';
import { AuthService } from '../auth.service';

describe('LoginPageComponent', () => {
  let fixture: ComponentFixture<LoginPageComponent>;
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
  });

  it('marks invalid form as touched', () => {
    fixture.componentInstance.submit();
    expect(fixture.componentInstance.form.touched).toBeTrue();
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('routes admins to admin dashboard', () => {
    auth.login.and.returnValue({ subscribe: (observer: any) => observer.next({ role: 'ROLE_ADMIN' }) } as any);
    fixture.componentInstance.form.setValue({ email: 'admin@example.com', password: 'Password1!', rememberMe: true });

    fixture.componentInstance.submit();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin');
  });
});
