import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AdminService, AdminUser, AdminStats, UserRole, AdminLoan, AdminReservation } from './admin.service';
import { ConfirmDialogComponent } from './confirm-dialog.component';

//
import { AddBookComponent } from './add-book/add-book.component';
import { BookManagementComponent } from './book-management/book-management.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DatePipe,
    MatButtonModule, MatIconModule, MatTableModule, MatChipsModule,
    MatSelectModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule,
    MatDialogModule, MatTabsModule, MatBadgeModule, MatDividerModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  //
  @ViewChild('bookList') bookList!: BookManagementComponent;

  readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  searchQuery = '';
  activeRoleFilter = signal<string>('all');

  currentUserId: number | null = null;


  readonly selectedUser = signal<AdminUser | null>(null);
  readonly userLoans = signal<AdminLoan[]>([]);
  readonly userReservations = signal<AdminReservation[]>([]);
  readonly loansLoading = signal(false);
  readonly loansError = signal<string | null>(null);
  readonly reservationsLoading = signal(false);
  readonly reservationsError = signal<string | null>(null);

  readonly stats = this.adminService.stats;

  readonly roleFilters = [
    { label: 'Tous', value: 'all' },
    { label: 'Lecteurs', value: 'ROLE_USER' },
    { label: 'Bibliothécaires', value: 'ROLE_LIBRARIAN' },
    { label: 'Admins', value: 'ROLE_ADMIN' },
  ];

  readonly filteredUsers = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const rf = this.activeRoleFilter();
    return this.adminService.users().filter((u) => {
      const matchRole = rf === 'all' || u.role === rf;
      const matchQuery = !q || `${u.firstName} ${u.lastName} ${u.email} ${this.roleLabel(u.role)}`.toLowerCase().includes(q);
      return matchRole && matchQuery;
    });
  });

  ngOnInit(): void { this.reload(); }

  setRoleFilter(value: string): void { this.activeRoleFilter.set(value); }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.adminService.loadStats().subscribe({ error: () => { } });
    this.adminService.loadUsers().subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Une erreur est survenue.');
      },
    });
  }

  openDetail(user: AdminUser): void {
    this.selectedUser.set(user);
    this.loadUserLoans(user);
    this.loadUserReservations(user);
  }

  closeDetail(): void { this.selectedUser.set(null); }

  loadUserLoans(user: AdminUser): void {
    this.loansLoading.set(true);
    this.loansError.set(null);
    this.adminService.getUserLoans(user.id).subscribe({
      next: (loans) => { this.userLoans.set(loans); this.loansLoading.set(false); },
      error: (err) => {
        this.loansLoading.set(false);
        this.loansError.set(err?.error?.message ?? 'Impossible de charger les emprunts.');
      },
    });
  }

  loadUserReservations(user: AdminUser): void {
    this.reservationsLoading.set(true);
    this.reservationsError.set(null);
    this.adminService.getUserReservations(user.id).subscribe({
      next: (resas) => { this.userReservations.set(resas); this.reservationsLoading.set(false); },
      error: (err) => {
        this.reservationsLoading.set(false);
        this.reservationsError.set(err?.error?.message ?? 'Impossible de charger les réservations.');
      },
    });
  }

  onRoleChange(user: AdminUser, newRole: UserRole): void {
    const roleMap: Record<UserRole, string> = {
      ROLE_USER: 'Lecteur', ROLE_LIBRARIAN: 'Bibliothécaire', ROLE_ADMIN: 'Administrateur',
    };
    const ref = this.dialog.open(ConfirmDialogComponent);
    ref.componentInstance.data = {
      title: 'Modifier le rôle',
      message: `Changer le rôle de ${user.firstName} ${user.lastName} en "${roleMap[newRole]}" ?`,
    };
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.adminService.updateRole(user.id, newRole).subscribe({
        next: (updated) => {
          this.selectedUser.set(updated);
          this.snack(`Rôle de ${user.firstName} mis à jour.`);
        },
        error: (err) => this.snack(err?.error?.message ?? 'Erreur.', true),
      });
    });
  }

  toggleActive(user: AdminUser, activate: boolean): void {
    if (activate) {
      this.openToggleDialog(user, true, false);
      return;
    }
    this.adminService.hasActiveReservations(user.id).subscribe({
      next: ({ hasActive }) => this.openToggleDialog(user, false, hasActive),
      error: () => this.openToggleDialog(user, false, false),
    });
  }

  private openToggleDialog(user: AdminUser, activate: boolean, hasActiveReservations: boolean): void {
    const ref = this.dialog.open(ConfirmDialogComponent);
    const warningLine = hasActiveReservations
      ? `\n\n⚠️ Cet utilisateur a des réservations en cours. Elles seront automatiquement annulées.`
      : '';
    ref.componentInstance.data = {
      title: activate ? 'Activer le compte' : 'Désactiver le compte',
      message: `Voulez-vous ${activate ? 'activer' : 'désactiver'} le compte de ${user.firstName} ${user.lastName} ?${warningLine}`,
    };
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      const call$ = activate
        ? this.adminService.activateUser(user.id)
        : this.adminService.deactivateUser(user.id);
      call$.subscribe({
        next: (updated) => {
          this.selectedUser.set(updated);
          const extra = (updated as any).hadActiveReservations
            ? ' Les réservations en cours ont été annulées.'
            : '';
          this.snack(`Compte ${activate ? 'activé' : 'désactivé'} avec succès.${extra}`);
        },
        error: (err) => this.snack(err?.error?.message ?? 'Erreur.', true),
      });
    });
  }

  deleteUserAccount(user: AdminUser): void {
    const ref = this.dialog.open(ConfirmDialogComponent);
    ref.componentInstance.data = {
      title: 'Anonymiser le compte (RGPD)',
      message:
        `Anonymiser le compte de ${user.firstName} ${user.lastName} ?\n\n` +
        `Les données personnelles (nom, prénom, email, téléphone) seront remplacées par des valeurs neutres. ` +
        `Les réservations actives seront annulées. L'historique des emprunts est conservé pour l'intégrité des données.\n\n` +
        `Cette action est irréversible.`,
    };
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.adminService.deleteUser(user.id).subscribe({
        next: (anonymized) => {
          this.selectedUser.set(anonymized);
          const warn = anonymized.hadActiveLoans
            ? ' ⚠️ Des emprunts non rendus existent encore sur ce compte.'
            : '';
          this.snack(`Compte anonymisé avec succès (RGPD).${warn}`);
        },
        error: (err) => this.snack(err?.error?.message ?? 'Erreur lors de l\'anonymisation.', true),
      });
    });
  }

  initials(u: AdminUser): string {
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase() || '?';
  }

  getRoleClass(role: UserRole): string {
    return { ROLE_USER: 'role-user', ROLE_LIBRARIAN: 'role-librarian', ROLE_ADMIN: 'role-admin' }[role] ?? 'role-user';
  }

  roleLabel(role: string): string {
    return { ROLE_USER: 'Lecteur', ROLE_LIBRARIAN: 'Bibliothécaire', ROLE_ADMIN: 'Administrateur' }[role] ?? role;
  }

  loanStatusLabel(status: string): string {
    return { ACTIVE: 'En cours', RETURNED: 'Retourné', OVERDUE: 'En retard' }[status] ?? status;
  }

  reservationStatusLabel(status: string): string {
    return { PENDING: 'En attente', AVAILABLE: 'Disponible', BORROWED: 'Emprunté', CANCELLED: 'Annulée' }[status] ?? status;
  }

  private snack(message: string, error = false): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 4000,
      panelClass: error ? ['snack-error'] : ['snack-success'],
    });
  }
}
