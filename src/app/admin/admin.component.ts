import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { AdminService, AdminUser, AdminStats, UserRole } from './admin.service';

// ─── Composant de confirmation inline ─────────────────────────────────────────

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <div class="confirm-dialog">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>{{ data.message }}</mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button mat-dialog-close>Annuler</button>
        <button mat-flat-button color="warn" [mat-dialog-close]="true">Confirmer</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog { padding: 0.5rem; }
    mat-dialog-content { padding: 1rem 0; }
  `],
})
export class ConfirmDialogComponent {
  data: { title: string; message: string } = { title: '', message: '' };
}

// ─── Composant principal Admin ─────────────────────────────────────────────────

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  template: `
    <div class="admin-page">

      <!-- ── En-tête ──────────────────────────────────────────────────────────── -->
      <header class="page-header">
        <div class="header-left">
          <div class="header-badge">
            <mat-icon>admin_panel_settings</mat-icon>
          </div>
          <div>
            <h1>Administration</h1>
            <p>Gestion des utilisateurs et pilotage de la plateforme</p>
          </div>
        </div>
        <button mat-stroked-button (click)="reload()" [disabled]="loading()">
          <mat-icon>refresh</mat-icon>
          Actualiser
        </button>
      </header>

      <!-- ── Statistiques ─────────────────────────────────────────────────────── -->
      @if (stats(); as s) {
        <section class="stats-grid">
          <div class="stat-card">
            <mat-icon class="stat-icon users">group</mat-icon>
            <div class="stat-body">
              <span class="stat-value">{{ s.totalUsers }}</span>
              <span class="stat-label">Utilisateurs</span>
            </div>
          </div>
          <div class="stat-card">
            <mat-icon class="stat-icon active">how_to_reg</mat-icon>
            <div class="stat-body">
              <span class="stat-value">{{ s.activeUsers }}</span>
              <span class="stat-label">Comptes actifs</span>
            </div>
          </div>
          <div class="stat-card">
            <mat-icon class="stat-icon books">menu_book</mat-icon>
            <div class="stat-body">
              <span class="stat-value">{{ s.totalBooks }}</span>
              <span class="stat-label">Livres</span>
            </div>
          </div>
          <div class="stat-card">
            <mat-icon class="stat-icon loans">calendar_month</mat-icon>
            <div class="stat-body">
              <span class="stat-value">{{ s.activeLoans }}</span>
              <span class="stat-label">Emprunts actifs</span>
            </div>
          </div>
          <div class="stat-card" [class.alert]="s.overdueLoans > 0">
            <mat-icon class="stat-icon overdue">warning</mat-icon>
            <div class="stat-body">
              <span class="stat-value">{{ s.overdueLoans }}</span>
              <span class="stat-label">Retards</span>
            </div>
          </div>
        </section>
      }

      <!-- ── Gestion des utilisateurs ─────────────────────────────────────────── -->
      <section class="users-section">
        <div class="section-header">
          <h2>Utilisateurs</h2>
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Rechercher un utilisateur</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [(ngModel)]="searchQuery" placeholder="Nom, prénom, email…" />
          </mat-form-field>
        </div>

        @if (loading()) {
          <div class="loading-state">
            <mat-spinner diameter="40" />
            <p>Chargement en cours…</p>
          </div>
        } @else if (error()) {
          <div class="error-state">
            <mat-icon>error_outline</mat-icon>
            <p>{{ error() }}</p>
            <button mat-flat-button color="primary" (click)="reload()">Réessayer</button>
          </div>
        } @else {
          <div class="table-wrapper">
            <table mat-table [dataSource]="filteredUsers()" class="users-table">

              <!-- Colonne Utilisateur -->
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef>Utilisateur</th>
                <td mat-cell *matCellDef="let u">
                  <div class="user-cell">
                    <div class="user-avatar" [class]="getRoleClass(u.role)">
                      {{ initials(u) }}
                    </div>
                    <div class="user-info">
                      <strong>{{ u.firstName }} {{ u.lastName }}</strong>
                      <span class="user-email">{{ u.email }}</span>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Colonne Téléphone -->
              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Téléphone</th>
                <td mat-cell *matCellDef="let u">{{ u.phone ?? '—' }}</td>
              </ng-container>

              <!-- Colonne Rôle -->
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Rôle</th>
                <td mat-cell *matCellDef="let u">
                  <mat-select
                    class="role-select"
                    [value]="u.role"
                    (selectionChange)="onRoleChange(u, $event.value)"
                    [disabled]="u.id === currentUserId">
                    <mat-option value="ROLE_USER">Lecteur</mat-option>
                    <mat-option value="ROLE_LIBRARIAN">Bibliothécaire</mat-option>
                    <mat-option value="ROLE_ADMIN">Administrateur</mat-option>
                  </mat-select>
                </td>
              </ng-container>

              <!-- Colonne Statut -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let u">
                  <span class="status-badge" [class.active]="u.active" [class.inactive]="!u.active">
                    <mat-icon>{{ u.active ? 'check_circle' : 'cancel' }}</mat-icon>
                    {{ u.active ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
              </ng-container>

              <!-- Colonne Inscription -->
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Inscrit le</th>
                <td mat-cell *matCellDef="let u">{{ u.createdAt | date:'dd/MM/yyyy' }}</td>
              </ng-container>

              <!-- Colonne Actions -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let u">
                  <div class="actions-cell">
                    @if (u.active) {
                      <button
                        mat-stroked-button
                        color="warn"
                        class="action-btn"
                        [disabled]="u.id === currentUserId"
                        [matTooltip]="u.id === currentUserId ? 'Impossible de désactiver votre propre compte' : 'Désactiver ce compte'"
                        (click)="toggleActive(u, false)">
                        <mat-icon>block</mat-icon>
                        Désactiver
                      </button>
                    } @else {
                      <button
                        mat-flat-button
                        color="primary"
                        class="action-btn"
                        matTooltip="Réactiver ce compte"
                        (click)="toggleActive(u, true)">
                        <mat-icon>check_circle</mat-icon>
                        Activer
                      </button>
                    }
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  [class.inactive-row]="!row.active"></tr>
            </table>

            @if (filteredUsers().length === 0) {
              <div class="empty-state">
                <mat-icon>search_off</mat-icon>
                <p>Aucun utilisateur ne correspond à votre recherche.</p>
              </div>
            }
          </div>

          <p class="table-footer">
            {{ filteredUsers().length }} utilisateur{{ filteredUsers().length > 1 ? 's' : '' }}
            sur {{ adminService.users().length }} au total
          </p>
        }
      </section>
    </div>
  `,
  styles: [`
    /* ── Layout ── */
    .admin-page {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* ── En-tête ── */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .header-badge {
      width: 3rem;
      height: 3rem;
      border-radius: 1rem;
      background: var(--bh-forest);
      color: #fff;
      display: grid;
      place-items: center;
    }
    .page-header h1 {
      margin: 0;
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 1.6rem;
    }
    .page-header p { margin: 0; color: var(--bh-ink-light); font-size: .9rem; }

    /* ── Statistiques ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
    }
    .stat-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid rgba(0,0,0,.07);
      box-shadow: 0 2px 8px rgba(0,0,0,.04);
      transition: box-shadow .2s;
    }
    .stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.09); }
    .stat-card.alert { border-color: #fca5a5; background: #fff7f7; }
    .stat-icon { font-size: 2rem; width: 2rem; height: 2rem; }
    .stat-icon.users   { color: #6366f1; }
    .stat-icon.active  { color: #22c55e; }
    .stat-icon.books   { color: var(--bh-forest); }
    .stat-icon.loans   { color: var(--bh-amber); }
    .stat-icon.overdue { color: #ef4444; }
    .stat-body { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.9rem; font-weight: 700; line-height: 1; }
    .stat-label { font-size: .8rem; color: var(--bh-ink-light); margin-top: .15rem; }

    /* ── Section utilisateurs ── */
    .users-section {
      background: #fff;
      border-radius: 20px;
      padding: 1.5rem;
      border: 1px solid rgba(0,0,0,.07);
      box-shadow: 0 2px 8px rgba(0,0,0,.04);
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .section-header h2 {
      margin: 0;
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 1.25rem;
    }
    .search-field { width: 300px; }

    /* ── Table ── */
    .table-wrapper { overflow-x: auto; border-radius: 12px; border: 1px solid rgba(0,0,0,.07); }
    .users-table { width: 100%; }
    .users-table th { font-weight: 600; color: var(--bh-ink-light); font-size: .85rem; text-transform: uppercase; letter-spacing: .04em; }
    .inactive-row { opacity: .55; }

    /* ── Cellule utilisateur ── */
    .user-cell { display: flex; align-items: center; gap: .75rem; }
    .user-avatar {
      width: 2.4rem;
      height: 2.4rem;
      border-radius: 999px;
      display: grid;
      place-items: center;
      font-weight: 700;
      font-size: .85rem;
      color: #fff;
      flex-shrink: 0;
    }
    .user-avatar.role-user      { background: #6366f1; }
    .user-avatar.role-librarian { background: var(--bh-forest); }
    .user-avatar.role-admin     { background: #f59e0b; }
    .user-info { display: flex; flex-direction: column; }
    .user-info strong { font-size: .95rem; }
    .user-email { font-size: .82rem; color: var(--bh-ink-light); }

    /* ── Role select ── */
    .role-select { width: 165px; font-size: .9rem; }

    /* ── Badges statut ── */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: .35rem;
      padding: .25rem .7rem;
      border-radius: 999px;
      font-size: .82rem;
      font-weight: 600;
    }
    .status-badge mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    .status-badge.active   { background: #dcfce7; color: #15803d; }
    .status-badge.inactive { background: #fee2e2; color: #b91c1c; }

    /* ── Actions ── */
    .actions-cell { display: flex; gap: .5rem; }
    .action-btn { border-radius: 999px; font-size: .82rem; }

    /* ── États ── */
    .loading-state, .error-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .75rem;
      padding: 3rem;
      color: var(--bh-ink-light);
    }
    .error-state mat-icon, .empty-state mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; }

    .table-footer { margin: .75rem 0 0; font-size: .85rem; color: var(--bh-ink-light); text-align: right; }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .search-field { width: 100%; }
      .section-header { flex-direction: column; align-items: flex-start; }
    }
  `],
})
export class AdminComponent implements OnInit {
  readonly adminService = inject(AdminService);
  private readonly snackBar  = inject(MatSnackBar);
  private readonly dialog    = inject(MatDialog);

  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);
  searchQuery = '';

  /** Id de l'admin connecté — récupéré via ProfileService ou le signal */
  currentUserId: number | null = null;

  readonly displayedColumns = ['user', 'phone', 'role', 'status', 'createdAt', 'actions'];

  readonly stats = this.adminService.stats;

  readonly filteredUsers = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.adminService.users();
    return this.adminService.users().filter((u) =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.loadStats().subscribe({ error: () => {} });

    this.adminService.loadUsers().subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Une erreur est survenue lors du chargement.');
      },
    });
  }

  onRoleChange(user: AdminUser, newRole: UserRole): void {
    const roleLabel: Record<UserRole, string> = {
      ROLE_USER: 'Lecteur',
      ROLE_LIBRARIAN: 'Bibliothécaire',
      ROLE_ADMIN: 'Administrateur',
    };

    const ref = this.dialog.open(ConfirmDialogComponent);
    const instance = ref.componentInstance;
    instance.data = {
      title: 'Modifier le rôle',
      message: `Changer le rôle de ${user.firstName} ${user.lastName} en "${roleLabel[newRole]}" ?`,
    };

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.adminService.updateRole(user.id, newRole).subscribe({
        next: () => this.snack(`Rôle de ${user.firstName} mis à jour.`),
        error: (err) => this.snack(err?.error?.message ?? 'Erreur lors de la mise à jour.', true),
      });
    });
  }

  toggleActive(user: AdminUser, activate: boolean): void {
    const action = activate ? 'activer' : 'désactiver';
    const ref = this.dialog.open(ConfirmDialogComponent);
    const instance = ref.componentInstance;
    instance.data = {
      title: activate ? 'Activer le compte' : 'Désactiver le compte',
      message: `Voulez-vous ${action} le compte de ${user.firstName} ${user.lastName} ?`,
    };

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      const call$ = activate
        ? this.adminService.activateUser(user.id)
        : this.adminService.deactivateUser(user.id);

      call$.subscribe({
        next: () => this.snack(`Compte ${activate ? 'activé' : 'désactivé'} avec succès.`),
        error: (err) => this.snack(err?.error?.message ?? 'Erreur lors de la modification.', true),
      });
    });
  }

  initials(u: AdminUser): string {
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase() || '?';
  }

  getRoleClass(role: UserRole): string {
    return {
      ROLE_USER: 'role-user',
      ROLE_LIBRARIAN: 'role-librarian',
      ROLE_ADMIN: 'role-admin',
    }[role] ?? 'role-user';
  }

  private snack(message: string, error = false): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 4000,
      panelClass: error ? ['snack-error'] : ['snack-success'],
    });
  }
}
