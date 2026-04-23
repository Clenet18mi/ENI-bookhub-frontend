import { Component, inject, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map, startWith } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive, RouterOutlet, MatButtonModule, MatIconModule, MatSidenavModule, MatToolbarModule],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly navOpen = signal(false);
  readonly isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((state) => state.matches),
    startWith(false),
  );

  readonly mainNav = [
    { label: 'Catalogue', icon: 'menu_book', link: '/catalogue' },
    { label: 'Profil', icon: 'person', link: '/profile' },
  ];

  toggleNav(): void {
    this.navOpen.update((value) => !value);
  }

  closeNav(): void {
    this.navOpen.set(false);
  }
}
