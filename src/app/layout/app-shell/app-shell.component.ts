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
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly navItems: ShellNavItem[] = [
    { label: 'Tableau de bord', icon: 'space_dashboard', link: '/dashboard' },
    { label: 'Profil', icon: 'person', link: '/profile' },
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

    const first = session.user.firstName.charAt(0);
    const last = session.user.lastName.charAt(0);
    return `${first}${last}`.toUpperCase();
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
