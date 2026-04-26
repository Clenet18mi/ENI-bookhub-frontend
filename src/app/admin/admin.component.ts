import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
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

// ─── Dialog de confirmation ────────────────────────────────────────────────────

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
  styles: [`.confirm-dialog { padding: 0.5rem; } mat-dialog-content { padding: 1rem 0; }`],
})
export class ConfirmDialogComponent {
  data: { title: string; message: string } = { title: '', message: '' };
}

// ─── Composant principal Admin ─────────────────────────────────────────────────

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
  template: `
    <div class="admin-root">

      <!-- ═══ VUE LISTE ═══════════════════════════════════════════════════════ -->
      <div class="list-pane" [class.hidden-mobile]="selectedUser()">

        <!-- En-tête -->
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

        <!-- Stats rapides -->
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

        <!-- Section utilisateurs -->
        <section class="users-section">
          <div class="section-header">
            <h2>Utilisateurs</h2>
            <div class="search-row">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Rechercher…</mat-label>
                <mat-icon matPrefix>search</mat-icon>
                <input matInput [(ngModel)]="searchQuery" placeholder="Nom, prénom, email, rôle…" />
                @if (searchQuery) {
                  <button matSuffix mat-icon-button (click)="searchQuery = ''" aria-label="Effacer">
                    <mat-icon>close</mat-icon>
                  </button>
                }
              </mat-form-field>
              <div class="role-filters">
                @for (f of roleFilters; track f.value) {
                  <button
                    class="filter-chip"
                    [class.active]="activeRoleFilter() === f.value"
                    (click)="setRoleFilter(f.value)">
                    {{ f.label }}
                  </button>
                }
              </div>
            </div>
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
            <div class="users-list">
              @for (u of filteredUsers(); track u.id) {
                <div
                  class="user-row"
                  [class.selected]="selectedUser()?.id === u.id"
                  [class.inactive-row]="!u.active"
                  (click)="openDetail(u)">

                  <div class="user-avatar" [class]="getRoleClass(u.role)">
                    {{ initials(u) }}
                  </div>

                  <div class="user-info">
                    <strong>{{ u.firstName }} {{ u.lastName }}</strong>
                    <span class="user-email">{{ u.email }}</span>
                    <span class="user-phone">{{ u.phone ?? '—' }}</span>
                  </div>

                  <div class="user-meta">
                    <span class="role-badge" [class]="getRoleClass(u.role)">{{ roleLabel(u.role) }}</span>
                    <span class="status-badge" [class.active]="u.active" [class.inactive]="!u.active">
                      <mat-icon>{{ u.active ? 'check_circle' : 'cancel' }}</mat-icon>
                      {{ u.active ? 'Actif' : 'Inactif' }}
                    </span>
                  </div>

                  <div class="user-date">
                    <span class="date-label">Inscrit le</span>
                    <span>{{ u.createdAt | date:'dd/MM/yyyy' }}</span>
                  </div>

                  <mat-icon class="chevron">chevron_right</mat-icon>
                </div>
              }

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

      <!-- ═══ PANNEAU DÉTAIL ═══════════════════════════════════════════════════ -->
      @if (selectedUser(); as user) {
        <aside class="detail-pane">

          <!-- Header panneau -->
          <div class="detail-header">
            <button mat-icon-button class="back-btn" (click)="closeDetail()" matTooltip="Retour à la liste">
              <mat-icon>arrow_back</mat-icon>
            </button>

            <div class="detail-avatar" [class]="getRoleClass(user.role)">
              {{ initials(user) }}
            </div>

            <div class="detail-title">
              <h2>{{ user.firstName }} {{ user.lastName }}</h2>
              <span class="role-badge" [class]="getRoleClass(user.role)">{{ roleLabel(user.role) }}</span>
              <span class="status-badge" [class.active]="user.active" [class.inactive]="!user.active">
                <mat-icon>{{ user.active ? 'check_circle' : 'cancel' }}</mat-icon>
                {{ user.active ? 'Actif' : 'Inactif' }}
              </span>
            </div>
          </div>

          <mat-divider />

          <!-- Infos personnelles -->
          <section class="detail-section">
            <h3 class="section-title"><mat-icon>person</mat-icon> Informations</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ user.email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Téléphone</span>
                <span class="info-value">{{ user.phone ?? '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Inscrit le</span>
                <span class="info-value">{{ user.createdAt | date:'dd MMMM yyyy':'':'fr' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Dernière modification</span>
                <span class="info-value">{{ user.updatedAt ? (user.updatedAt | date:'dd/MM/yyyy') : '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">ID utilisateur</span>
                <span class="info-value mono">#{{ user.id }}</span>
              </div>
            </div>
          </section>

          <!-- Actions rapides -->
          <section class="detail-section">
            <h3 class="section-title"><mat-icon>settings</mat-icon> Actions</h3>
            <div class="actions-row">
              <mat-form-field appearance="outline" class="role-select-field">
                <mat-label>Rôle</mat-label>
                <mat-select
                  [value]="user.role"
                  (selectionChange)="onRoleChange(user, $event.value)"
                  [disabled]="user.id === currentUserId">
                  <mat-option value="ROLE_USER">Lecteur</mat-option>
                  <mat-option value="ROLE_LIBRARIAN">Bibliothécaire</mat-option>
                  <mat-option value="ROLE_ADMIN">Administrateur</mat-option>
                </mat-select>
              </mat-form-field>

              @if (user.active) {
                <button
                  mat-stroked-button
                  color="warn"
                  [disabled]="user.id === currentUserId"
                  (click)="toggleActive(user, false)">
                  <mat-icon>block</mat-icon>
                  Désactiver
                </button>
              } @else {
                <button mat-flat-button color="primary" (click)="toggleActive(user, true)">
                  <mat-icon>check_circle</mat-icon>
                  Activer
                </button>
              }
            </div>
          </section>

          <mat-divider />

          <!-- Onglets Emprunts / Réservations -->
          <mat-tab-group class="detail-tabs" animationDuration="200ms">

            <!-- Emprunts -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">menu_book</mat-icon>
                Emprunts
                @if (userLoans().length > 0) {
                  <span class="tab-count">{{ userLoans().length }}</span>
                }
              </ng-template>

              <div class="tab-content">
                @if (loansLoading()) {
                  <div class="loading-state small"><mat-spinner diameter="28" /></div>
                } @else if (loansError()) {
                  <div class="error-inline">
                    <mat-icon>error_outline</mat-icon>
                    <span>{{ loansError() }}</span>
                    <button mat-button (click)="loadUserLoans(user)">Réessayer</button>
                  </div>
                } @else if (userLoans().length === 0) {
                  <div class="empty-inline">
                    <mat-icon>inbox</mat-icon>
                    <p>Aucun emprunt enregistré.</p>
                  </div>
                } @else {
                  <div class="loan-list">
                    @for (loan of userLoans(); track loan.id) {
                      <div class="loan-card" [class.overdue]="loan.status === 'OVERDUE'">
                        <div class="loan-status-bar" [class]="'bar-' + loan.status.toLowerCase()"></div>
                        <div class="loan-info">
                          <strong class="loan-title">{{ loan.bookTitle }}</strong>
                          <span class="loan-author">{{ loan.bookAuthor }}</span>
                          @if (loan.bookIsbn) {
                            <span class="loan-isbn">ISBN : {{ loan.bookIsbn }}</span>
                          }
                        </div>
                        <div class="loan-dates">
                          <div class="date-pair">
                            <span class="info-label">Emprunté</span>
                            <span>{{ loan.loanDate | date:'dd/MM/yy' }}</span>
                          </div>
                          <div class="date-pair">
                            <span class="info-label">Retour prévu</span>
                            <span [class.overdue-text]="loan.status === 'OVERDUE'">{{ loan.dueDate | date:'dd/MM/yy' }}</span>
                          </div>
                          @if (loan.returnDate) {
                            <div class="date-pair">
                              <span class="info-label">Retourné le</span>
                              <span class="returned-text">{{ loan.returnDate | date:'dd/MM/yy' }}</span>
                            </div>
                          }
                        </div>
                        <span class="loan-status-chip" [class]="'chip-' + loan.status.toLowerCase()">
                          {{ loanStatusLabel(loan.status) }}
                        </span>
                      </div>
                    }
                  </div>
                }
              </div>
            </mat-tab>

            <!-- Réservations -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon">bookmark</mat-icon>
                Réservations
                @if (userReservations().length > 0) {
                  <span class="tab-count">{{ userReservations().length }}</span>
                }
              </ng-template>

              <div class="tab-content">
                @if (reservationsLoading()) {
                  <div class="loading-state small"><mat-spinner diameter="28" /></div>
                } @else if (reservationsError()) {
                  <div class="error-inline">
                    <mat-icon>error_outline</mat-icon>
                    <span>{{ reservationsError() }}</span>
                    <button mat-button (click)="loadUserReservations(user)">Réessayer</button>
                  </div>
                } @else if (userReservations().length === 0) {
                  <div class="empty-inline">
                    <mat-icon>bookmark_border</mat-icon>
                    <p>Aucune réservation.</p>
                  </div>
                } @else {
                  <div class="loan-list">
                    @for (resa of userReservations(); track resa.id) {
                      <div class="loan-card">
                        <div class="loan-status-bar" [class]="'bar-' + resa.status.toLowerCase()"></div>
                        <div class="loan-info">
                          <strong class="loan-title">{{ resa.bookTitle }}</strong>
                          <span class="loan-author">{{ resa.bookAuthor }}</span>
                        </div>
                        <div class="loan-dates">
                          <div class="date-pair">
                            <span class="info-label">Réservé le</span>
                            <span>{{ resa.reservationDate | date:'dd/MM/yy' }}</span>
                          </div>
                          <div class="date-pair">
                            <span class="info-label">Position</span>
                            <span>{{ resa.rank }}</span>
                          </div>
                        </div>
                        <span class="loan-status-chip" [class]="'chip-' + resa.status.toLowerCase()">
                          {{ reservationStatusLabel(resa.status) }}
                        </span>
                      </div>
                    }
                  </div>
                }
              </div>
            </mat-tab>

          </mat-tab-group>
        </aside>
      }
    </div>
  `,
  styles: [`
    /* ── Layout root ─────────────────────────────────────────────────────────── */
    .admin-root {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    @media (min-width: 1024px) {
      .admin-root:has(.detail-pane) {
        grid-template-columns: 1fr 440px;
        align-items: start;
      }
    }

    /* ── En-tête ─────────────────────────────────────────────────────────────── */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    .header-left { display: flex; align-items: center; gap: 1rem; }
    .header-badge {
      width: 3rem; height: 3rem; border-radius: 1rem;
      background: var(--bh-forest); color: #fff;
      display: grid; place-items: center;
    }
    .page-header h1 {
      margin: 0;
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 1.6rem;
    }
    .page-header p { margin: 0; color: var(--bh-ink-light); font-size: .9rem; }

    /* ── Stats ───────────────────────────────────────────────────────────────── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.1rem;
      display: flex;
      align-items: center;
      gap: .9rem;
      border: 1px solid rgba(0,0,0,.07);
      box-shadow: 0 2px 8px rgba(0,0,0,.04);
      transition: box-shadow .2s, transform .15s;
    }
    .stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.09); transform: translateY(-1px); }
    .stat-card.alert { border-color: #fca5a5; background: #fff7f7; }
    .stat-icon { font-size: 2rem; width: 2rem; height: 2rem; }
    .stat-icon.users   { color: #6366f1; }
    .stat-icon.active  { color: #22c55e; }
    .stat-icon.books   { color: var(--bh-forest); }
    .stat-icon.loans   { color: var(--bh-amber); }
    .stat-icon.overdue { color: #ef4444; }
    .stat-body { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.8rem; font-weight: 700; line-height: 1; }
    .stat-label { font-size: .78rem; color: var(--bh-ink-light); margin-top: .15rem; }

    /* ── Section utilisateurs ────────────────────────────────────────────────── */
    .users-section {
      background: #fff;
      border-radius: 20px;
      padding: 1.5rem;
      border: 1px solid rgba(0,0,0,.07);
      box-shadow: 0 2px 8px rgba(0,0,0,.04);
    }
    .section-header { margin-bottom: 1.25rem; }
    .section-header h2 {
      margin: 0 0 .75rem;
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 1.25rem;
    }
    .search-row {
      display: flex;
      align-items: center;
      gap: .75rem;
      flex-wrap: wrap;
    }
    .search-field { flex: 1; min-width: 220px; }
    .role-filters { display: flex; gap: .4rem; flex-wrap: wrap; }
    .filter-chip {
      padding: .35rem .85rem;
      border-radius: 999px;
      border: 1.5px solid rgba(0,0,0,.12);
      background: transparent;
      font-size: .82rem;
      cursor: pointer;
      transition: all .15s;
      font-family: inherit;
      color: var(--bh-ink);
    }
    .filter-chip:hover { border-color: var(--bh-forest); color: var(--bh-forest); }
    .filter-chip.active {
      background: var(--bh-forest);
      border-color: var(--bh-forest);
      color: #fff;
    }

    /* ── Liste utilisateurs ──────────────────────────────────────────────────── */
    .users-list { display: flex; flex-direction: column; gap: .5rem; }
    .user-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: .85rem 1rem;
      border-radius: 14px;
      border: 1.5px solid transparent;
      cursor: pointer;
      transition: all .15s;
      background: rgba(0,0,0,.01);
    }
    .user-row:hover { background: rgba(31,77,58,.04); border-color: rgba(31,77,58,.15); }
    .user-row.selected { background: rgba(31,77,58,.07); border-color: var(--bh-forest); }
    .inactive-row { opacity: .6; }

    .user-avatar {
      width: 2.6rem; height: 2.6rem; border-radius: 999px;
      display: grid; place-items: center;
      font-weight: 700; font-size: .9rem; color: #fff; flex-shrink: 0;
    }
    .user-avatar.role-user, .role-badge.role-user         { background: #6366f1; }
    .user-avatar.role-librarian, .role-badge.role-librarian { background: var(--bh-forest); }
    .user-avatar.role-admin, .role-badge.role-admin       { background: #f59e0b; }

    .user-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .user-info strong { font-size: .95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-email { font-size: .82rem; color: var(--bh-ink-light); }
    .user-phone { font-size: .8rem; color: var(--bh-ink-light); }

    .user-meta { display: flex; flex-direction: column; align-items: flex-end; gap: .3rem; }
    .role-badge {
      padding: .2rem .65rem; border-radius: 999px;
      font-size: .75rem; font-weight: 700; color: #fff;
      white-space: nowrap;
    }
    .status-badge {
      display: inline-flex; align-items: center; gap: .25rem;
      padding: .2rem .6rem; border-radius: 999px;
      font-size: .75rem; font-weight: 600;
    }
    .status-badge mat-icon { font-size: .95rem; width: .95rem; height: .95rem; }
    .status-badge.active   { background: #dcfce7; color: #15803d; }
    .status-badge.inactive { background: #fee2e2; color: #b91c1c; }

    .user-date { display: flex; flex-direction: column; align-items: flex-end; font-size: .8rem; color: var(--bh-ink-light); }
    .date-label { font-size: .72rem; text-transform: uppercase; letter-spacing: .04em; }

    .chevron { color: rgba(0,0,0,.25); flex-shrink: 0; }
    .table-footer { margin: .75rem 0 0; font-size: .85rem; color: var(--bh-ink-light); text-align: right; }

    /* ── États ───────────────────────────────────────────────────────────────── */
    .loading-state, .error-state, .empty-state {
      display: flex; flex-direction: column; align-items: center;
      gap: .75rem; padding: 3rem; color: var(--bh-ink-light);
    }
    .loading-state.small { padding: 1.5rem; }
    .error-state mat-icon, .empty-state mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; }
    .error-inline, .empty-inline {
      display: flex; align-items: center; gap: .5rem;
      padding: 1.25rem; color: var(--bh-ink-light); font-size: .9rem;
    }

    /* ═══ PANNEAU DÉTAIL ══════════════════════════════════════════════════════ */
    .detail-pane {
      background: #fff;
      border-radius: 20px;
      border: 1px solid rgba(0,0,0,.08);
      box-shadow: 0 4px 24px rgba(0,0,0,.07);
      overflow: hidden;
      position: sticky;
      top: 1.5rem;
    }

    .detail-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: linear-gradient(135deg, rgba(31,77,58,.06) 0%, rgba(31,77,58,.02) 100%);
    }
    .back-btn { flex-shrink: 0; }

    .detail-avatar {
      width: 3.5rem; height: 3.5rem; border-radius: 999px;
      display: grid; place-items: center;
      font-weight: 700; font-size: 1.1rem; color: #fff; flex-shrink: 0;
    }
    .detail-title { display: flex; flex-direction: column; gap: .35rem; flex: 1; min-width: 0; }
    .detail-title h2 {
      margin: 0;
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 1.2rem;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .detail-title > div { display: flex; gap: .4rem; flex-wrap: wrap; }

    .detail-section { padding: 1.25rem 1.5rem; }
    .section-title {
      display: flex; align-items: center; gap: .5rem;
      margin: 0 0 .9rem;
      font-size: .9rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .05em; color: var(--bh-ink-light);
    }
    .section-title mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
    .info-item { display: flex; flex-direction: column; gap: .15rem; }
    .info-label { font-size: .75rem; text-transform: uppercase; letter-spacing: .04em; color: var(--bh-ink-light); }
    .info-value { font-size: .92rem; font-weight: 500; }
    .mono { font-family: 'Courier New', monospace; }

    .actions-row {
      display: flex; align-items: center; gap: .75rem; flex-wrap: wrap;
    }
    .role-select-field { width: 200px; }

    /* ── Tabs ─────────────────────────────────────────────────────────────────── */
    .detail-tabs { width: 100%; }
    .tab-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; margin-right: .35rem; }
    .tab-count {
      display: inline-flex; align-items: center; justify-content: center;
      width: 1.35rem; height: 1.35rem; border-radius: 999px;
      background: var(--bh-forest); color: #fff;
      font-size: .72rem; font-weight: 700; margin-left: .35rem;
    }
    .tab-content { padding: 1rem 1.5rem 1.5rem; }

    /* ── Cartes emprunts/réservations ─────────────────────────────────────────── */
    .loan-list { display: flex; flex-direction: column; gap: .6rem; }
    .loan-card {
      display: grid;
      grid-template-columns: 4px 1fr auto;
      grid-template-rows: auto auto;
      column-gap: .85rem;
      row-gap: .5rem;
      padding: .9rem 1rem;
      border-radius: 12px;
      border: 1px solid rgba(0,0,0,.07);
      background: #fafafa;
    }
    .loan-card.overdue { background: #fff7f7; border-color: #fca5a5; }
    .loan-status-bar {
      grid-column: 1; grid-row: 1 / 3;
      width: 4px; border-radius: 2px; align-self: stretch; min-height: 40px;
    }
    .bar-active    { background: #22c55e; }
    .bar-returned  { background: #94a3b8; }
    .bar-overdue   { background: #ef4444; }
    .bar-pending   { background: #f59e0b; }
    .bar-waiting   { background: #f59e0b; }
    .bar-available { background: #22c55e; }
    .bar-cancelled { background: #94a3b8; }
    .bar-canceled  { background: #94a3b8; }
    .bar-borrowed  { background: #6366f1; }

    .loan-info { grid-column: 2; grid-row: 1; display: flex; flex-direction: column; min-width: 0; }
    .loan-title { font-size: .9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .loan-author { font-size: .8rem; color: var(--bh-ink-light); }
    .loan-isbn { font-size: .72rem; color: var(--bh-ink-light); font-family: monospace; margin-top: .1rem; }

    .loan-dates { grid-column: 2; grid-row: 2; display: flex; gap: 1.2rem; flex-wrap: wrap; }
    .date-pair { display: flex; flex-direction: column; gap: .1rem; }
    .date-pair .info-label { font-size: .7rem; text-transform: uppercase; letter-spacing: .04em; color: var(--bh-ink-light); font-weight: 600; }
    .date-pair span:last-child { font-size: .85rem; font-weight: 500; }
    .overdue-text { color: #ef4444 !important; font-weight: 700 !important; }
    .returned-text { color: #15803d; }

    .loan-status-chip {
      grid-column: 3; grid-row: 1; align-self: start;
      padding: .25rem .65rem; border-radius: 999px;
      font-size: .75rem; font-weight: 700; white-space: nowrap;
    }
    .chip-active    { background: #dcfce7; color: #15803d; }
    .chip-returned  { background: #f1f5f9; color: #64748b; }
    .chip-overdue   { background: #fee2e2; color: #b91c1c; }
    .chip-pending   { background: #fef3c7; color: #92400e; }
    .chip-waiting   { background: #fef3c7; color: #92400e; }
    .chip-available { background: #dcfce7; color: #15803d; }
    .chip-cancelled { background: #f1f5f9; color: #64748b; }
    .chip-canceled  { background: #f1f5f9; color: #64748b; }
    .chip-borrowed  { background: #ede9fe; color: #5b21b6; }

    /* ── Mobile ──────────────────────────────────────────────────────────────── */
    @media (max-width: 1023px) {
      .hidden-mobile { display: none; }
      .detail-pane { position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 100%; z-index: 100; overflow-y: auto; border-radius: 0; }
    }
    @media (max-width: 640px) {
      .user-date, .user-meta .role-badge { display: none; }
      .info-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class AdminComponent implements OnInit {
  readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog   = inject(MatDialog);

  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);

  searchQuery = '';
  activeRoleFilter = signal<string>('all');

  currentUserId: number | null = null;

  // Panneau détail
  readonly selectedUser         = signal<AdminUser | null>(null);
  readonly userLoans            = signal<AdminLoan[]>([]);
  readonly userReservations     = signal<AdminReservation[]>([]);
  readonly loansLoading         = signal(false);
  readonly loansError           = signal<string | null>(null);
  readonly reservationsLoading  = signal(false);
  readonly reservationsError    = signal<string | null>(null);

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
    this.adminService.loadStats().subscribe({ error: () => {} });
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
        // Fallback: on affiche un message lisible si l'API n'est pas dispo
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
      // Activation simple — pas de vérification nécessaire
      this.openToggleDialog(user, true, false);
      return;
    }
    // Désactivation : vérifier d'abord les réservations actives
    this.adminService.hasActiveReservations(user.id).subscribe({
      next: ({ hasActive }) => this.openToggleDialog(user, false, hasActive),
      error: () => this.openToggleDialog(user, false, false), // si erreur, on laisse passer
    });
  }

  private openToggleDialog(user: AdminUser, activate: boolean, hasActiveReservations: boolean): void {
    const ref = this.dialog.open(ConfirmDialogComponent);

    const warningLine = hasActiveReservations
      ? `

⚠️ Cet utilisateur a des réservations en cours. Elles seront automatiquement annulées.`
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