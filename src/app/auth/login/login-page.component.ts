import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent implements OnInit {
  private readonly fb = new FormBuilder();
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [true],
  });

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    const deleted = this.route.snapshot.queryParamMap.get('deleted');
    if (deleted === 'true') {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
      this.snackBar.open(
        'Votre compte a bien été supprimé. Vos données ont été anonymisées conformément au RGPD.',
        'Fermer',
        {
          duration: 8000,
          panelClass: ['snack-deleted'],
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    // Vrai appel HTTP vers POST /api/auth/login
    this.authService.login(this.form.getRawValue()).subscribe({
        next: (response) => {
          this.loading.set(false);

          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

          if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
            return;
          }

          switch (response.role) {
            case 'ROLE_ADMIN':
              this.router.navigateByUrl('/admin');
              break;

            case 'ROLE_LIBRARIAN':
              this.router.navigateByUrl('/dashboard');
              break;

            case 'ROLE_USER':
            default:
              this.router.navigateByUrl('/dashboard');
              break;
          }
        },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401 || err.status === 403) {
          this.errorMessage.set('Email ou mot de passe incorrect.');
        } else if (err.status === 0) {
          this.errorMessage.set('Impossible de contacter le serveur. Vérifiez votre connexion.');
        } else {
          this.errorMessage.set('Une erreur est survenue. Veuillez réessayer.');
        }
      },
    });
  }

  hasError(controlName: 'email' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.invalid;
  }
}
