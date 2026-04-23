import { Component, inject, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map, startWith } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
<<<<<<< HEAD
import { AuthService } from '../../auth/auth.service';
=======
>>>>>>> origin/main

@Component({
  selector: 'app-shell',
  standalone: true,
<<<<<<< HEAD
  imports: [AsyncPipe, RouterLink, RouterLinkActive, RouterOutlet, MatButtonModule, MatIconModule, MatSidenavModule, MatToolbarModule],
=======
  imports: [
    AsyncPipe,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
  ],
>>>>>>> origin/main
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
<<<<<<< HEAD
  private readonly authService = inject(AuthService);
=======
>>>>>>> origin/main

  readonly navOpen = signal(false);
  readonly isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((state) => state.matches),
    startWith(false),
  );

  readonly mainNav = [
    { label: 'Dashboard', icon: 'dashboard', link: '/dashboard' },
    { label: 'Catalogue', icon: 'menu_book', link: '/catalogue' },
<<<<<<< HEAD
=======
    { label: 'Mes emprunts', icon: 'history', link: '/loans' },
>>>>>>> origin/main
  ];

  toggleNav(): void {
    this.navOpen.update((value) => !value);
  }

  closeNav(): void {
    this.navOpen.set(false);
  }
<<<<<<< HEAD

  logout(): void {
    this.authService.clearSession();
  }
=======
>>>>>>> origin/main
}
