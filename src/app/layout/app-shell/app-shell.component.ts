import { HostListener, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../auth/auth.service';

interface ShellNavItem {
  label: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatButtonModule, MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule],
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav class="sidenav" [mode]="isMobile ? 'over' : 'side'" [opened]="drawerOpened">
        <div class="brand-block">
          <div class="brand-mark">B</div>
          <div>
            <div class="brand-name">Book<span>Hub</span></div>
            <div class="brand-tag">Espace lecteur</div>
          </div>
        </div>

        <nav mat-nav-list class="nav-list">
          @for (item of navItems; track item.link) {
            <a mat-list-item [routerLink]="item.link" routerLinkActive="active" (click)="closeDrawer()">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </nav>
      </mat-sidenav>

      <mat-sidenav-content class="content-shell">
        <mat-toolbar class="topbar">
          <button mat-icon-button type="button" class="menu-button" (click)="toggleDrawer()" aria-label="Ouvrir le menu">
            <mat-icon>menu</mat-icon>
          </button>

          <div class="topbar-copy">
            <p>BookHub</p>
            <span>Bibliothèque communautaire</span>
          </div>

          <span class="spacer"></span>

          <a class="profile-chip" routerLink="/profile" aria-label="Ouvrir mon profil">
            <div class="avatar">{{ userInitials }}</div>
            <div class="profile-meta">
              <strong>{{ userLabel }}</strong>
              <span>{{ userEmail }}</span>
            </div>
          </a>

          <button mat-stroked-button type="button" class="logout-button" (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Déconnexion</span>
          </button>
        </mat-toolbar>

        <main class="main-content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      :host { display: block; min-height: 100vh; }
      .shell { min-height: 100vh; background: linear-gradient(180deg, #f7f3ea 0%, #f3eee3 100%); }
      .sidenav { width: 280px; padding: 1.25rem; background: rgba(255,255,255,.96); border-right: 1px solid rgba(26,26,26,.08); }
      .brand-block { display: flex; align-items: center; gap: .9rem; padding: .75rem .25rem 1.5rem; }
      .brand-mark, .avatar { width: 3rem; height: 3rem; border-radius: 1rem; display: grid; place-items: center; font-family: 'DM Serif Display', Georgia, serif; }
      .brand-mark { background: var(--bh-forest); color: #fff; font-size: 1.35rem; }
      .brand-name { font-family: 'DM Serif Display', Georgia, serif; font-size: 1.55rem; line-height: 1; }
      .brand-name span { color: var(--bh-amber); }
      .brand-tag { color: var(--bh-ink-light); font-size: .92rem; }
      .nav-list { display: grid; gap: .35rem; }
      .nav-list a { border-radius: 14px; margin: 0 .15rem; text-decoration: none; }
      .nav-list a:hover,
      .nav-list a:visited,
      .nav-list a:active { text-decoration: none; }
      .nav-list a.active { background: var(--bh-forest-pale); color: var(--bh-forest); }
      .content-shell { min-height: 100vh; }
      .topbar { position: sticky; top: 0; z-index: 5; gap: 1rem; background: rgba(255,255,255,.78); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(26,26,26,.08); }
      .topbar-copy { display: grid; gap: .1rem; }
      .topbar-copy p, .topbar-copy span { margin: 0; }
      .topbar-copy p { font-family: 'DM Serif Display', Georgia, serif; font-size: 1.2rem; }
      .topbar-copy span, .profile-meta span { color: var(--bh-ink-light); font-size: .92rem; }
      .spacer { flex: 1; }
      .profile-chip { display: inline-flex; align-items: center; gap: .75rem; padding: .45rem .7rem; border-radius: 999px; background: rgba(31,77,58,.06); text-decoration: none; color: inherit; }
      .profile-chip:hover { background: rgba(31,77,58,.1); }
      .avatar { background: var(--bh-forest); color: #fff; font-size: .95rem; }
      .profile-meta { display: grid; }
      .profile-meta strong { font-size: .95rem; }
      .logout-button { border-radius: 999px; }
      .main-content { padding: 1.25rem; }
      @media (max-width: 960px) { .sidenav { width: min(86vw, 300px); } }
      @media (max-width: 640px) { .topbar { padding-inline: .5rem; } .topbar-copy span, .logout-button span, .profile-meta span { display: none; } .main-content { padding: .85rem; } }
    `,
  ],
})
export class AppShellComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly navItems: ShellNavItem[] = [
    { label: 'Tableau de bord', icon: 'space_dashboard', link: '/dashboard' },
    { label: 'Catalogue', icon: 'local_library', link: '/catalogue' },
    { label: 'Mes emprunts', icon: 'calendar_month', link: '/loans' },
  ];

  protected isMobile = typeof window !== 'undefined' ? window.innerWidth < 960 : false;
  protected drawerOpened = !this.isMobile;

  get userLabel(): string {
    const session = this.authService.getSession();
    if (!session) {
      return 'Invité';
    }

    return `${session.user.firstName} ${session.user.lastName}`.trim();
  }

  get userEmail(): string {
    return this.authService.getSession()?.user.email ?? 'Connexion locale';
  }

  get userInitials(): string {
    const session = this.authService.getSession();
    if (!session) {
      return 'BH';
    }

    return `${session.user.firstName.charAt(0)}${session.user.lastName.charAt(0)}`.toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  toggleDrawer(): void {
    this.drawerOpened = !this.drawerOpened;
  }

  closeDrawer(): void {
    if (this.isMobile) {
      this.drawerOpened = false;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = typeof window !== 'undefined' ? window.innerWidth < 960 : false;
    this.drawerOpened = !this.isMobile;
  }
}
