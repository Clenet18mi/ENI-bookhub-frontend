import { HostListener, Component, inject, OnInit, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../auth/auth.service';
import { ProfileService, UserProfile } from '../../profile/profile.service';

interface ShellNavItem {
  label: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterLink, RouterLinkActive, RouterOutlet,
    MatButtonModule, MatIconModule, MatListModule,
    MatSidenavModule, MatToolbarModule, MatChipsModule,
  ],
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav class="sidenav" [mode]="isMobile ? 'over' : 'side'" [opened]="drawerOpened">

        <!-- Brand -->
        <div class="brand-block">
          <div class="brand-mark">B</div>
          <div>
            <div class="brand-name">Book<span>Hub</span></div>
            <div class="brand-tag" [class.admin-tag]="isAdmin()">
              @if (isAdmin()) {
                <mat-icon class="tag-icon">admin_panel_settings</mat-icon>
                Espace Admin
              } @else if (isLibrarian()) {
                <mat-icon class="tag-icon">local_library</mat-icon>
                Bibliothécaire
              } @else {
                Espace lecteur
              }
            </div>
          </div>
        </div>

        @if (isAdmin()) {
          <div class="nav-section-label">Administration</div>
        } @else {
          <div class="nav-section-label">Navigation</div>
        }

        <nav mat-nav-list class="nav-list">
          @for (item of navItems(); track item.link) {
            <a mat-list-item [routerLink]="item.link" routerLinkActive="active" (click)="closeDrawer()">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </nav>

        <!-- Profil sidebar -->
        <div class="sidebar-profile">
          <a class="sidebar-profile-chip" routerLink="/profile">
            <div class="avatar">{{ userInitials() }}</div>
            <div class="profile-meta">
              <strong>{{ userLabel() }}</strong>
              <span>{{ userEmail() }}</span>
            </div>
          </a>
          <button mat-icon-button class="logout-icon-btn" (click)="logout()" aria-label="Déconnexion">
            <mat-icon>logout</mat-icon>
          </button>
        </div>

      </mat-sidenav>

      <mat-sidenav-content class="content-shell">
        <mat-toolbar class="topbar">
          <button mat-icon-button type="button" class="menu-button" (click)="toggleDrawer()" aria-label="Menu">
            <mat-icon>menu</mat-icon>
          </button>

          <div class="topbar-copy">
            <p>BookHub</p>
            <span>Bibliothèque communautaire</span>
          </div>

          <span class="spacer"></span>

          @if (isAdmin()) {
            <span class="role-chip admin-chip">
              <mat-icon>admin_panel_settings</mat-icon>
              Admin
            </span>
          } @else if (isLibrarian()) {
            <span class="role-chip librarian-chip">
              <mat-icon>local_library</mat-icon>
              Bibliothécaire
            </span>
          }

          <a class="profile-chip" routerLink="/profile" aria-label="Profil">
            <div class="avatar">{{ userInitials() }}</div>
            <div class="profile-meta">
              <strong>{{ userLabel() }}</strong>
              <span>{{ userEmail() }}</span>
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
  styles: [`
    :host { display: block; min-height: 100vh; }
    .shell { min-height: 100vh; background: linear-gradient(180deg, #f7f3ea 0%, #f3eee3 100%); }

    .sidenav {
      width: 280px; padding: 1.25rem; display: flex; flex-direction: column;
      background: rgba(255,255,255,.96); border-right: 1px solid rgba(26,26,26,.08);
    }

    .brand-block { display: flex; align-items: center; gap: .9rem; padding: .75rem .25rem 1.25rem; }
    .brand-mark, .avatar {
      width: 3rem; height: 3rem; border-radius: 1rem;
      display: grid; place-items: center;
      font-family: 'DM Serif Display', Georgia, serif;
    }
    .brand-mark { background: var(--bh-forest); color: #fff; font-size: 1.35rem; }
    .brand-name { font-family: 'DM Serif Display', Georgia, serif; font-size: 1.55rem; line-height: 1; }
    .brand-name span { color: var(--bh-amber); }
    .brand-tag { display: flex; align-items: center; gap: .25rem; color: var(--bh-ink-light); font-size: .82rem; }
    .brand-tag.admin-tag { color: #b45309; font-weight: 600; }
    .tag-icon { font-size: .95rem; width: .95rem; height: .95rem; }

    .nav-section-label {
      font-size: .7rem; text-transform: uppercase; letter-spacing: .1em;
      color: var(--bh-ink-light); padding: 0 .75rem .4rem; margin-bottom: .1rem;
    }

    .nav-list { display: grid; gap: .35rem; }
    .nav-list a { border-radius: 14px; margin: 0 .15rem; text-decoration: none; }
    .nav-list a:hover, .nav-list a:visited, .nav-list a:active { text-decoration: none; }
    .nav-list a.active { background: var(--bh-forest-pale); color: var(--bh-forest); }

    .sidebar-profile {
      margin-top: auto; padding-top: 1rem;
      border-top: 1px solid rgba(0,0,0,.07);
      display: flex; align-items: center; gap: .5rem;
    }
    .sidebar-profile-chip {
      display: flex; align-items: center; gap: .65rem;
      flex: 1; text-decoration: none; color: inherit;
      padding: .45rem; border-radius: 12px; transition: background .15s;
    }
    .sidebar-profile-chip:hover { background: rgba(0,0,0,.04); }
    .sidebar-profile-chip .avatar { width: 2.4rem; height: 2.4rem; background: var(--bh-forest); color: #fff; font-size: .85rem; border-radius: 999px; }
    .profile-meta { display: flex; flex-direction: column; }
    .profile-meta strong { font-size: .9rem; }
    .profile-meta span { font-size: .75rem; color: var(--bh-ink-light); }
    .logout-icon-btn { flex-shrink: 0; color: var(--bh-ink-light); }

    .content-shell { min-height: 100vh; }
    .topbar {
      position: sticky; top: 0; z-index: 5; gap: .75rem;
      background: rgba(255,255,255,.78); backdrop-filter: blur(14px);
      border-bottom: 1px solid rgba(26,26,26,.08);
    }
    .topbar-copy { display: grid; gap: .1rem; }
    .topbar-copy p, .topbar-copy span { margin: 0; }
    .topbar-copy p { font-family: 'DM Serif Display', Georgia, serif; font-size: 1.2rem; }
    .topbar-copy span { color: var(--bh-ink-light); font-size: .82rem; }
    .spacer { flex: 1; }

    .role-chip {
      display: inline-flex; align-items: center; gap: .3rem;
      padding: .3rem .75rem; border-radius: 999px; font-size: .8rem; font-weight: 700;
    }
    .role-chip mat-icon { font-size: .9rem; width: .9rem; height: .9rem; }
    .admin-chip     { background: #fef3c7; color: #92400e; }
    .librarian-chip { background: rgba(31,77,58,.1); color: var(--bh-forest); }

    .profile-chip {
      display: inline-flex; align-items: center; gap: .65rem;
      padding: .4rem .65rem; border-radius: 999px;
      background: rgba(31,77,58,.06); text-decoration: none; color: inherit;
      transition: background .15s;
    }
    .profile-chip:hover { background: rgba(31,77,58,.1); }
    .profile-chip .avatar { background: var(--bh-forest); color: #fff; font-size: .9rem; border-radius: 999px; }
    .logout-button { border-radius: 999px; }

    .main-content { padding: 1.25rem; }

    @media (max-width: 960px) { .sidenav { width: min(86vw, 300px); } }
    @media (max-width: 640px) {
      .topbar { padding-inline: .5rem; }
      .topbar-copy span, .logout-button span, .profile-meta span, .role-chip { display: none; }
      .main-content { padding: .85rem; }
    }
  `],
})
export class AppShellComponent implements OnInit {
  private readonly authService    = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly router         = inject(Router);

  readonly navItems = computed<ShellNavItem[]>(() => {
    const role = this.profileService.currentProfile()?.role;

    if (role === 'ROLE_ADMIN') {
      return [
        { label: 'Tableau de bord', icon: 'space_dashboard', link: '/dashboard' },
        { label: 'Utilisateurs',    icon: 'group',            link: '/admin' },
      ];
    }

    if (role === 'ROLE_LIBRARIAN') {
      return [
        { label: 'Tableau de bord', icon: 'space_dashboard',  link: '/dashboard' },
        { label: 'Catalogue',       icon: 'local_library',    link: '/catalogue' },
        { label: 'Mes emprunts',    icon: 'calendar_month',   link: '/loans' },
        { label: 'Réservations',    icon: 'bookmark',         link: '/reservations' },
      ];
    }

    // Lecteur standard
    return [
      { label: 'Tableau de bord', icon: 'space_dashboard', link: '/dashboard' },
      { label: 'Catalogue',       icon: 'local_library',   link: '/catalogue' },
      { label: 'Mes emprunts',    icon: 'calendar_month',  link: '/loans' },
      { label: 'Réservations',    icon: 'bookmark',        link: '/reservations' },
    ];
  });

  readonly isAdmin     = computed(() => this.profileService.currentProfile()?.role === 'ROLE_ADMIN');
  readonly isLibrarian = computed(() => this.profileService.currentProfile()?.role === 'ROLE_LIBRARIAN');

  protected isMobile     = typeof window !== 'undefined' ? window.innerWidth < 960 : false;
  protected drawerOpened = !this.isMobile;

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: () => {},
      error: () => {
        this.authService.logout();
        this.router.navigateByUrl('/login');
      },
    });
  }

  userLabel(): string {
    const p = this.profileService.currentProfile();
    if (p) return `${p.firstName} ${p.lastName}`.trim();
    return this.authService.getSession()?.user.firstName ?? 'Chargement…';
  }

  userEmail(): string {
    return this.profileService.currentProfile()?.email
        ?? this.authService.getSession()?.user.email ?? '';
  }

  userInitials(): string {
    const p = this.profileService.currentProfile();
    if (p) return ((p.firstName?.[0] ?? '') + (p.lastName?.[0] ?? '')).toUpperCase() || 'BH';
    return this.authService.getSession()?.user.firstName?.[0]?.toUpperCase() ?? 'BH';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  toggleDrawer(): void { this.drawerOpened = !this.drawerOpened; }

  closeDrawer(): void {
    if (this.isMobile) this.drawerOpened = false;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile     = typeof window !== 'undefined' ? window.innerWidth < 960 : false;
    this.drawerOpened = !this.isMobile;
  }
}
