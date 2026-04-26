import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Loan, LoansService } from './loans.service';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <!-- ════════════════════════ PAGE HEADER ════════════════════════ -->
    <section class="loans-page">
      <header class="loans-header">
        <div class="header-text">
          <p class="eyebrow">Lecteur</p>
          <h1>Mes emprunts</h1>
          <p class="lead">Suivez vos livres en cours, vos retards et consultez votre historique.</p>
        </div>
        <a mat-stroked-button routerLink="/catalogue" class="cta-catalogue">
          <mat-icon>search</mat-icon>
          Explorer le catalogue
        </a>
      </header>

      <!-- ════════════════════ ÉTAT : CHARGEMENT ═══════════════════ -->
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="40" />
          <p>Chargement de vos emprunts…</p>
        </div>
      }

      <!-- ════════════════════ ÉTAT : ERREUR ═══════════════════════ -->
      @else if (error()) {
        <div class="error-state">
          <mat-icon>error_outline</mat-icon>
          <p>Impossible de charger vos emprunts. Veuillez réessayer.</p>
          <button mat-flat-button (click)="load()">
            <mat-icon>refresh</mat-icon> Réessayer
          </button>
        </div>
      }

      <!-- ════════════════════ CONTENU PRINCIPAL ═══════════════════ -->
      @else {

        <!-- Alerte retards -->
        @if (overdueLoans().length > 0) {
          <div class="overdue-alert" role="alert">
            <div class="overdue-icon"><mat-icon>warning_amber</mat-icon></div>
            <div class="overdue-text">
              <strong>
                {{ overdueLoans().length }} emprunt{{ overdueLoans().length > 1 ? 's' : '' }} en retard
              </strong>
              <span>Merci de retourner ces livres rapidement à la bibliothèque.</span>
            </div>
          </div>
        }

        <!-- ── Résumé compteurs ── -->
        <div class="summary-row">
          <div class="summary-chip chip-active">
            <mat-icon>menu_book</mat-icon>
            <span><strong>{{ activeLoans().length }}</strong> en cours</span>
          </div>
          @if (overdueLoans().length > 0) {
            <div class="summary-chip chip-overdue">
              <mat-icon>schedule</mat-icon>
              <span><strong>{{ overdueLoans().length }}</strong> en retard</span>
            </div>
          }
          <div class="summary-chip chip-history">
            <mat-icon>history</mat-icon>
            <span><strong>{{ historyLoans().length }}</strong> retourné{{ historyLoans().length > 1 ? 's' : '' }}</span>
          </div>
        </div>

        <!-- ── Onglets ── -->
        <mat-tab-group class="loans-tabs" animationDuration="200ms">

          <!-- ════ ONGLET EN COURS ════ -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">menu_book</mat-icon>
              En cours
              @if (activeAndOverdue().length > 0) {
                <span class="tab-badge" [class.badge-warn]="overdueLoans().length > 0">
                  {{ activeAndOverdue().length }}
                </span>
              }
            </ng-template>

            <div class="tab-content">
              @if (activeAndOverdue().length === 0) {
                <div class="empty-state">
                  <mat-icon>auto_stories</mat-icon>
                  <p>Aucun emprunt en cours.</p>
                  <a mat-flat-button routerLink="/catalogue">Parcourir le catalogue</a>
                </div>
              } @else {
                <div class="loan-grid">
                  @for (loan of activeAndOverdue(); track loan.id) {
                    <article class="loan-card" [class.is-overdue]="loan.status === 'OVERDUE'">

                      <!-- Couverture -->
                      <div class="book-thumb" aria-hidden="true">
                        @if (loan.bookCoverUrl) {
                          <img [src]="loan.bookCoverUrl" [alt]="loan.bookTitle" loading="lazy" />
                        } @else {
                          <div class="thumb-placeholder">
                            <mat-icon>auto_stories</mat-icon>
                          </div>
                        }
                      </div>

                      <!-- Infos -->
                      <div class="loan-body">
                        <div class="loan-top">
                          <div class="loan-meta-text">
                            <h3 class="book-title">{{ loan.bookTitle }}</h3>
                            <p class="book-author">{{ loan.bookAuthor }}</p>
                            @if (loan.bookCategory) {
                              <span class="book-category">{{ loan.bookCategory }}</span>
                            }
                          </div>
                          <span class="status-badge" [class]="'badge-' + loan.status.toLowerCase()">
                            <mat-icon>{{ statusIcon(loan.status) }}</mat-icon>
                            {{ statusLabel(loan.status) }}
                          </span>
                        </div>

                        <div class="loan-dates">
                          <div class="date-item">
                            <span class="date-label">Emprunté le</span>
                            <span class="date-value">{{ loan.loanDate | date:'dd/MM/yyyy' }}</span>
                          </div>
                          <div class="date-sep" aria-hidden="true"></div>
                          <div class="date-item" [class.date-late]="loan.status === 'OVERDUE'">
                            <span class="date-label">Retour prévu</span>
                            <span class="date-value due-date">
                              {{ loan.dueDate | date:'dd/MM/yyyy' }}
                            </span>
                          </div>
                        </div>

                        <!-- Barre de progression / compte à rebours -->
                        <div class="progress-wrap">
                          @if (loan.status === 'OVERDUE') {
                            <div class="countdown overdue-count">
                              <mat-icon>alarm</mat-icon>
                              {{ daysLate(loan.dueDate) }} jour{{ daysLate(loan.dueDate) > 1 ? 's' : '' }} de retard
                            </div>
                          } @else {
                            <div class="progress-bar-track"
                                 [matTooltip]="daysLeft(loan.dueDate) + ' jours restants'">
                              <div class="progress-bar-fill"
                                   [style.width.%]="progressPct(loan.loanDate, loan.dueDate)"
                                   [class.bar-warn]="daysLeft(loan.dueDate) <= 3">
                              </div>
                            </div>
                            <span class="countdown">
                              @if (daysLeft(loan.dueDate) === 0) {
                                Retour attendu aujourd'hui
                              } @else {
                                {{ daysLeft(loan.dueDate) }} jour{{ daysLeft(loan.dueDate) > 1 ? 's' : '' }} restant{{ daysLeft(loan.dueDate) > 1 ? 's' : '' }}
                              }
                            </span>
                          }
                        </div>
                      </div>

                    </article>
                  }
                </div>
              }
            </div>
          </mat-tab>

          <!-- ════ ONGLET HISTORIQUE ════ -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">history</mat-icon>
              Historique
              @if (historyLoans().length > 0) {
                <span class="tab-badge badge-neutral">{{ historyLoans().length }}</span>
              }
            </ng-template>

            <div class="tab-content">
              @if (historyLoans().length === 0) {
                <div class="empty-state">
                  <mat-icon>history_edu</mat-icon>
                  <p>Votre historique est vide pour l'instant.</p>
                </div>
              } @else {
                <div class="loan-grid history-grid">
                  @for (loan of historyLoans(); track loan.id) {
                    <article class="loan-card loan-card-history">

                      <!-- Couverture -->
                      <div class="book-thumb" aria-hidden="true">
                        @if (loan.bookCoverUrl) {
                          <img [src]="loan.bookCoverUrl" [alt]="loan.bookTitle" loading="lazy" />
                        } @else {
                          <div class="thumb-placeholder">
                            <mat-icon>auto_stories</mat-icon>
                          </div>
                        }
                      </div>

                      <!-- Infos -->
                      <div class="loan-body">
                        <div class="loan-top">
                          <div class="loan-meta-text">
                            <h3 class="book-title">{{ loan.bookTitle }}</h3>
                            <p class="book-author">{{ loan.bookAuthor }}</p>
                            @if (loan.bookCategory) {
                              <span class="book-category">{{ loan.bookCategory }}</span>
                            }
                          </div>
                          <span class="status-badge badge-returned">
                            <mat-icon>check_circle</mat-icon>
                            Rendu
                          </span>
                        </div>

                        <div class="loan-dates">
                          <div class="date-item">
                            <span class="date-label">Emprunté le</span>
                            <span class="date-value">{{ loan.loanDate | date:'dd/MM/yyyy' }}</span>
                          </div>
                          <div class="date-sep" aria-hidden="true"></div>
                          <div class="date-item">
                            <span class="date-label">Rendu le</span>
                            <span class="date-value">{{ (loan.returnDate ?? loan.dueDate) | date:'dd/MM/yyyy' }}</span>
                          </div>
                          <div class="date-sep" aria-hidden="true"></div>
                          <div class="date-item">
                            <span class="date-label">Durée</span>
                            <span class="date-value">{{ loanDuration(loan.loanDate, loan.returnDate ?? loan.dueDate) }} j.</span>
                          </div>
                        </div>

                        <!-- Indicateur retard/dans les temps -->
                        @if (wasLate(loan.dueDate, loan.returnDate)) {
                          <div class="late-indicator">
                            <mat-icon>info_outline</mat-icon>
                            Rendu avec {{ daysLateHistory(loan.dueDate, loan.returnDate) }} jour{{ daysLateHistory(loan.dueDate, loan.returnDate) > 1 ? 's' : '' }} de retard
                          </div>
                        } @else {
                          <div class="ontime-indicator">
                            <mat-icon>verified</mat-icon>
                            Rendu dans les délais
                          </div>
                        }
                      </div>

                    </article>
                  }
                </div>
              }
            </div>
          </mat-tab>

        </mat-tab-group>
      }
    </section>
  `,
  styles: [`
    /* ══════════════════════════════════════════════════════════
       LAYOUT
    ══════════════════════════════════════════════════════════ */
    .loans-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 960px;
      margin: 0 auto;
    }

    /* ══════════════════════════════════════════════════════════
       HEADER
    ══════════════════════════════════════════════════════════ */
    .loans-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .eyebrow {
      margin: 0 0 .2rem;
      font-size: .78rem;
      text-transform: uppercase;
      letter-spacing: .1em;
      color: var(--bh-forest);
      font-weight: 700;
    }
    .loans-header h1 {
      margin: 0;
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 2rem;
      line-height: 1.1;
      color: var(--bh-ink);
    }
    .lead {
      margin: .4rem 0 0;
      color: var(--bh-ink-light);
      font-size: .9rem;
    }
    .cta-catalogue {
      align-self: center;
      flex-shrink: 0;
    }

    /* ══════════════════════════════════════════════════════════
       ÉTATS : chargement / erreur / vide
    ══════════════════════════════════════════════════════════ */
    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 4rem 2rem;
      color: var(--bh-ink-light);
    }
    .error-state mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; color: #ef4444; }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .75rem;
      padding: 3.5rem 2rem;
      color: var(--bh-ink-light);
    }
    .empty-state mat-icon { font-size: 3rem; width: 3rem; height: 3rem; opacity: .4; }
    .empty-state p { margin: 0; font-size: .95rem; }

    /* ══════════════════════════════════════════════════════════
       ALERTE RETARDS
    ══════════════════════════════════════════════════════════ */
    .overdue-alert {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: #fff5f5;
      border: 1.5px solid #fca5a5;
      border-radius: 14px;
      animation: slideIn .25s ease-out;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .overdue-icon {
      width: 2.5rem;
      height: 2.5rem;
      background: #fee2e2;
      border-radius: 10px;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .overdue-icon mat-icon { color: #dc2626; font-size: 1.3rem; }
    .overdue-text { display: flex; flex-direction: column; gap: .15rem; }
    .overdue-text strong { color: #b91c1c; font-size: .95rem; }
    .overdue-text span { color: var(--bh-ink-light); font-size: .83rem; }

    /* ══════════════════════════════════════════════════════════
       RÉSUMÉ COMPTEURS
    ══════════════════════════════════════════════════════════ */
    .summary-row {
      display: flex;
      gap: .75rem;
      flex-wrap: wrap;
    }
    .summary-chip {
      display: flex;
      align-items: center;
      gap: .45rem;
      padding: .45rem .9rem;
      border-radius: 99px;
      font-size: .83rem;
      font-weight: 500;
    }
    .summary-chip mat-icon { font-size: 1rem; width: 1rem; height: 1rem; }
    .summary-chip strong  { font-weight: 700; }
    .chip-active  { background: var(--bh-forest-pale); color: var(--bh-forest); }
    .chip-overdue { background: #fee2e2; color: #b91c1c; }
    .chip-history { background: #f1f5f9; color: #475569; }

    /* ══════════════════════════════════════════════════════════
       ONGLETS
    ══════════════════════════════════════════════════════════ */
    .loans-tabs {
      background: transparent;
    }
    ::ng-deep .loans-tabs .mat-mdc-tab-body-wrapper {
      background: transparent;
    }
    ::ng-deep .loans-tabs .mdc-tab__text-label {
      display: flex;
      align-items: center;
      gap: .35rem;
    }
    .tab-icon { font-size: 1.05rem; width: 1.05rem; height: 1.05rem; }
    .tab-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.3rem;
      height: 1.3rem;
      padding: 0 .35rem;
      border-radius: 99px;
      font-size: .72rem;
      font-weight: 700;
      margin-left: .3rem;
    }
    .tab-badge.badge-warn    { background: #fee2e2; color: #b91c1c; }
    .tab-badge.badge-neutral { background: #f1f5f9; color: #475569; }

    .tab-content {
      padding-top: 1.25rem;
    }

    /* ══════════════════════════════════════════════════════════
       GRILLE DE CARTES
    ══════════════════════════════════════════════════════════ */
    .loan-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* ══════════════════════════════════════════════════════════
       CARTE EMPRUNT
    ══════════════════════════════════════════════════════════ */
    .loan-card {
      display: flex;
      gap: 1.25rem;
      background: #fff;
      border-radius: 18px;
      padding: 1.25rem;
      border: 1.5px solid rgba(0,0,0,.07);
      box-shadow: 0 2px 8px rgba(0,0,0,.04);
      transition: box-shadow .2s, transform .15s;
    }
    .loan-card:hover {
      box-shadow: 0 6px 20px rgba(0,0,0,.09);
      transform: translateY(-1px);
    }
    .loan-card.is-overdue {
      border-color: #fca5a5;
      background: linear-gradient(135deg, #fff 80%, #fff5f5 100%);
    }
    .loan-card-history {
      opacity: .88;
    }
    .loan-card-history:hover {
      opacity: 1;
    }

    /* Couverture */
    .book-thumb {
      width: 4rem;
      height: 5.5rem;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .book-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .thumb-placeholder {
      width: 100%;
      height: 100%;
      background: var(--bh-forest-pale);
      display: grid;
      place-items: center;
      border-radius: 8px;
    }
    .thumb-placeholder mat-icon {
      color: var(--bh-forest);
      font-size: 1.6rem;
      opacity: .6;
    }

    /* Corps de la carte */
    .loan-body { display: flex; flex-direction: column; gap: .75rem; flex: 1; min-width: 0; }
    .loan-top  { display: flex; align-items: flex-start; justify-content: space-between; gap: .75rem; }
    .loan-meta-text { flex: 1; min-width: 0; }
    .book-title {
      margin: 0 0 .2rem;
      font-size: 1rem;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .book-author  { margin: 0; font-size: .83rem; color: var(--bh-ink-light); }
    .book-category {
      display: inline-block;
      margin-top: .35rem;
      font-size: .74rem;
      padding: .15rem .55rem;
      background: var(--bh-forest-pale);
      color: var(--bh-forest);
      border-radius: 99px;
      font-weight: 600;
    }

    /* Badges de statut */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: .25rem;
      padding: .25rem .65rem;
      border-radius: 99px;
      font-size: .75rem;
      font-weight: 700;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .status-badge mat-icon { font-size: .85rem; width: .85rem; height: .85rem; }
    .badge-active   { background: #dcfce7; color: #15803d; }
    .badge-overdue  { background: #fee2e2; color: #b91c1c; }
    .badge-returned { background: #f1f5f9; color: #475569; }
    .badge-pending  { background: var(--bh-amber-pale); color: var(--bh-amber); }

    /* Dates */
    .loan-dates {
      display: flex;
      align-items: center;
      gap: .75rem;
      flex-wrap: wrap;
    }
    .date-item { display: flex; flex-direction: column; gap: .05rem; }
    .date-label { font-size: .72rem; color: var(--bh-ink-light); text-transform: uppercase; letter-spacing: .04em; }
    .date-value { font-size: .88rem; font-weight: 600; }
    .date-late .date-value { color: #dc2626; }
    .date-sep {
      width: 1px;
      height: 2.2rem;
      background: rgba(0,0,0,.1);
      flex-shrink: 0;
    }
    .due-date { }

    /* Barre de progression */
    .progress-wrap {
      display: flex;
      align-items: center;
      gap: .75rem;
    }
    .progress-bar-track {
      flex: 1;
      height: 6px;
      background: #f1f5f9;
      border-radius: 3px;
      overflow: hidden;
      cursor: default;
    }
    .progress-bar-fill {
      height: 100%;
      background: var(--bh-forest);
      border-radius: 3px;
      transition: width .4s ease;
    }
    .progress-bar-fill.bar-warn { background: #d97706; }

    .countdown {
      font-size: .78rem;
      color: var(--bh-ink-light);
      white-space: nowrap;
    }
    .overdue-count {
      display: flex;
      align-items: center;
      gap: .3rem;
      color: #b91c1c;
      font-weight: 600;
      font-size: .8rem;
    }
    .overdue-count mat-icon { font-size: .9rem; width: .9rem; height: .9rem; }

    /* Indicateurs historique */
    .late-indicator, .ontime-indicator {
      display: flex;
      align-items: center;
      gap: .3rem;
      font-size: .78rem;
      border-radius: 99px;
      padding: .2rem .6rem;
      width: fit-content;
    }
    .late-indicator mat-icon, .ontime-indicator mat-icon { font-size: .85rem; width: .85rem; height: .85rem; }
    .late-indicator   { background: #fff5f5; color: #b91c1c; }
    .ontime-indicator { background: #dcfce7; color: #15803d; }

    /* ══════════════════════════════════════════════════════════
       RESPONSIVE
    ══════════════════════════════════════════════════════════ */
    @media (max-width: 600px) {
      .loans-header { flex-direction: column; }
      .loan-card    { flex-direction: column; }
      .book-thumb   { width: 100%; height: 8rem; }
      .thumb-placeholder { height: 8rem; }
      .loan-dates   { flex-direction: column; gap: .5rem; }
      .date-sep     { display: none; }
    }
  `],
})
export class LoansComponent implements OnInit {

  private readonly loansService = inject(LoansService);

  // ── État ──────────────────────────────────────────────────────────────────
  readonly loading = signal(true);
  readonly error   = signal(false);
  private readonly _loans = signal<Loan[]>([]);

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly activeLoans = computed(() =>
    this._loans().filter((l) => l.status === 'ACTIVE' || l.status === 'PENDING')
  );
  readonly overdueLoans = computed(() =>
    this._loans().filter((l) => l.status === 'OVERDUE')
  );
  readonly activeAndOverdue = computed(() =>
    this._loans().filter((l) => l.status !== 'RETURNED')
  );
  readonly historyLoans = computed(() =>
    this._loans().filter((l) => l.status === 'RETURNED')
  );

  // ── Cycle de vie ──────────────────────────────────────────────────────────
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.loansService.getMyLoans().subscribe({
      next: (loans) => {
        this._loans.set(loans);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  // ── Helpers dates ────────────────────────────────────────────────────────

  /** Jours restants avant la date de retour (peut être négatif). */
  daysLeft(dueDate: string): number {
    const diff = new Date(dueDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86_400_000));
  }

  /** Jours de retard (emprunt actif). */
  daysLate(dueDate: string): number {
    const diff = Date.now() - new Date(dueDate).getTime();
    return Math.max(1, Math.ceil(diff / 86_400_000));
  }

  /** Retard sur un emprunt retourné. */
  daysLateHistory(dueDate: string, returnDate: string | null): number {
    if (!returnDate) return 0;
    const diff = new Date(returnDate).getTime() - new Date(dueDate).getTime();
    return Math.max(1, Math.ceil(diff / 86_400_000));
  }

  /** L'emprunt retourné l'a-t-il été en retard ? */
  wasLate(dueDate: string, returnDate: string | null): boolean {
    if (!returnDate) return false;
    return new Date(returnDate) > new Date(dueDate);
  }

  /** Durée totale d'un emprunt (en jours). */
  loanDuration(loanDate: string, returnDate: string): number {
    const diff = new Date(returnDate).getTime() - new Date(loanDate).getTime();
    return Math.max(1, Math.ceil(diff / 86_400_000));
  }

  /** Pourcentage de la durée d'emprunt écoulée (0–100). */
  progressPct(loanDate: string, dueDate: string): number {
    const start  = new Date(loanDate).getTime();
    const end    = new Date(dueDate).getTime();
    const now    = Date.now();
    const total  = end - start;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, ((now - start) / total) * 100));
  }

  // ── Helpers affichage ────────────────────────────────────────────────────
  statusLabel(status: string): string {
    return ({ ACTIVE: 'En cours', OVERDUE: 'En retard', RETURNED: 'Rendu', PENDING: 'En attente' } as Record<string,string>)[status] ?? status;
  }

  statusIcon(status: string): string {
    return ({ ACTIVE: 'check_circle', OVERDUE: 'warning_amber', RETURNED: 'assignment_return', PENDING: 'hourglass_empty' } as Record<string,string>)[status] ?? 'circle';
  }
}
