import { Component, OnInit, Signal, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminDashboardService, AdminDashboardStats } from '../admin/admin-dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatTooltipModule, MatProgressSpinnerModule],
  template: `
    <div class="admin-dashboard">

      <!-- ── En-tête ────────────────────────────────────────────────────────── -->
      <header class="dash-header">
        <div>
          <h1>Tableau de bord</h1>
          <p class="dash-subtitle">Vue d'ensemble de la bibliothèque — {{ today }}</p>
        </div>
        <button mat-stroked-button (click)="reload()">
          <mat-icon>refresh</mat-icon>
          Actualiser
        </button>
      </header>

      @if (loading()) {
        <div class="loading-overlay">
          <mat-spinner diameter="48" />
          <p>Chargement des statistiques…</p>
        </div>
      } @else if (s(); as stats) {

        <!-- ── KPIs principaux ─────────────────────────────────────────────── -->
        <section class="kpi-grid">
          <div class="kpi-card forest">
            <div class="kpi-icon-wrap"><mat-icon>group</mat-icon></div>
            <div class="kpi-body">
              <span class="kpi-value">{{ stats.totalUsers }}</span>
              <span class="kpi-label">Adhérents</span>
              <span class="kpi-sub">{{ stats.activeUsers }} actifs · {{ stats.inactiveUsers }} inactifs</span>
            </div>
          </div>

          <div class="kpi-card indigo">
            <div class="kpi-icon-wrap"><mat-icon>auto_stories</mat-icon></div>
            <div class="kpi-body">
              <span class="kpi-value">{{ stats.totalBooks }}</span>
              <span class="kpi-label">Livres au catalogue</span>
              <span class="kpi-sub">{{ stats.availableBooks }} disponibles</span>
            </div>
          </div>

          <div class="kpi-card amber">
            <div class="kpi-icon-wrap"><mat-icon>calendar_month</mat-icon></div>
            <div class="kpi-body">
              <span class="kpi-value">{{ stats.activeLoans }}</span>
              <span class="kpi-label">Emprunts actifs</span>
              <span class="kpi-sub">{{ stats.returnedThisMonth }} retours ce mois</span>
            </div>
          </div>

          <div class="kpi-card" [class.rose]="stats.overdueLoans > 0" [class.slate]="stats.overdueLoans === 0">
            <div class="kpi-icon-wrap"><mat-icon>warning_amber</mat-icon></div>
            <div class="kpi-body">
              <span class="kpi-value">{{ stats.overdueLoans }}</span>
              <span class="kpi-label">Retards en cours</span>
              <span class="kpi-sub">{{ stats.pendingReservations }} réservations en attente</span>
            </div>
          </div>
        </section>

        <!-- ── Ligne 2 : Graphique + Top livres ──────────────────────────────── -->
        <div class="row-two">

          <!-- Graphique emprunts/retours -->
          <div class="chart-card">
            <div class="card-header">
              <h2>Emprunts & retours</h2>
              <span class="card-subtitle">6 derniers mois</span>
            </div>
            <div class="bar-chart">
              @for (m of stats.loansByMonth; track m.month) {
                <div class="month-group">
                  <div class="bars">
                    <div
                      class="bar loans-bar"
                      [style.height.px]="barHeight(m.loans, stats.loansByMonth)"
                      [matTooltip]="m.loans + ' emprunts'">
                      <span class="bar-val">{{ m.loans }}</span>
                    </div>
                    <div
                      class="bar returns-bar"
                      [style.height.px]="barHeight(m.returns, stats.loansByMonth)"
                      [matTooltip]="m.returns + ' retours'">
                      <span class="bar-val">{{ m.returns }}</span>
                    </div>
                  </div>
                  <span class="month-label">{{ m.month }}</span>
                </div>
              }
            </div>
            <div class="chart-legend">
              <span class="legend-dot loans-dot"></span><span>Emprunts</span>
              <span class="legend-dot returns-dot"></span><span>Retours</span>
            </div>
          </div>

          <!-- Répartition des rôles -->
          <div class="roles-card">
            <div class="card-header">
              <h2>Répartition des rôles</h2>
            </div>
            <div class="donut-wrap">
              <svg class="donut" viewBox="0 0 120 120">
                @for (seg of donutSegments(stats.usersByRole); track seg.role) {
                  <circle
                    class="donut-ring"
                    cx="60" cy="60" r="45"
                    [style.stroke]="seg.color"
                    [style.stroke-dasharray]="seg.dash"
                    [style.stroke-dashoffset]="seg.offset"
                    [matTooltip]="seg.role + ' : ' + seg.count" />
                }
                <text x="60" y="56" class="donut-center-val" text-anchor="middle">{{ stats.totalUsers }}</text>
                <text x="60" y="70" class="donut-center-label" text-anchor="middle">total</text>
              </svg>
              <div class="donut-legend">
                @for (seg of donutSegments(stats.usersByRole); track seg.role) {
                  <div class="donut-leg-item">
                    <span class="donut-dot" [style.background]="seg.color"></span>
                    <span class="leg-role">{{ seg.role }}</span>
                    <strong class="leg-count">{{ seg.count }}</strong>
                  </div>
                }
              </div>
            </div>
          </div>

        </div>

        <!-- ── Ligne 3 : Top livres + Activité récente ───────────────────────── -->
        <div class="row-three">

          <!-- Top 5 livres -->
          <div class="topbooks-card">
            <div class="card-header">
              <h2>Top 5 livres</h2>
              <a mat-button routerLink="/admin" class="see-all">Voir le catalogue →</a>
            </div>
            <div class="topbooks-list">
              @for (book of stats.topBooks; track book.title; let i = $index) {
                <div class="topbook-row">
                  <span class="book-rank" [class.top3]="i < 3">#{{ i + 1 }}</span>
                  <div class="book-info">
                    <strong class="book-title">{{ book.title }}</strong>
                    <span class="book-author">{{ book.author }}</span>
                  </div>
                  <div class="book-bar-wrap">
                    <div class="book-bar" [style.width.%]="(book.loanCount / stats.topBooks[0].loanCount) * 100"></div>
                  </div>
                  <span class="book-count">{{ book.loanCount }}<small> emprunts</small></span>
                </div>
              }
            </div>
          </div>

          <!-- Activité récente -->
          <div class="activity-card">
            <div class="card-header">
              <h2>Activité récente</h2>
            </div>
            <div class="activity-feed">
              @for (item of stats.recentActivity; track item.date + item.userName) {
                <div class="activity-item">
                  <div class="activity-icon" [class]="'act-' + item.type">
                    <mat-icon>{{ activityIcon(item.type) }}</mat-icon>
                  </div>
                  <div class="activity-text">
                    <strong>{{ item.userName }}</strong>
                    <span>{{ activityLabel(item.type, item.bookTitle) }}</span>
                  </div>
                  <span class="activity-date">{{ item.date | date:'dd/MM' }}</span>
                </div>
              }
            </div>
          </div>

        </div>

        <!-- ── Indicateurs de disponibilité ──────────────────────────────────── -->
        <section class="availability-section">
          <div class="card-header">
            <h2>Disponibilité du fonds</h2>
          </div>
          <div class="avail-bars">
            <div class="avail-item">
              <span class="avail-label">Livres disponibles</span>
              <div class="avail-track">
                <div class="avail-fill green" [style.width.%]="(stats.availableBooks / stats.totalBooks) * 100"></div>
              </div>
              <span class="avail-pct">{{ ((stats.availableBooks / stats.totalBooks) * 100) | number:'1.0-0' }}%</span>
            </div>
            <div class="avail-item">
              <span class="avail-label">Emprunts actifs</span>
              <div class="avail-track">
                <div class="avail-fill amber" [style.width.%]="(stats.activeLoans / stats.totalBooks) * 100"></div>
              </div>
              <span class="avail-pct">{{ stats.activeLoans }} livres</span>
            </div>
            <div class="avail-item">
              <span class="avail-label">En retard</span>
              <div class="avail-track">
                <div class="avail-fill rose" [style.width.%]="(stats.overdueLoans / stats.activeLoans) * 100"></div>
              </div>
              <span class="avail-pct">{{ ((stats.overdueLoans / stats.activeLoans) * 100) | number:'1.0-0' }}%</span>
            </div>
            <div class="avail-item">
              <span class="avail-label">Taux d'utilisation</span>
              <div class="avail-track">
                <div class="avail-fill forest" [style.width.%]="((stats.totalBooks - stats.availableBooks) / stats.totalBooks) * 100"></div>
              </div>
              <span class="avail-pct">{{ (((stats.totalBooks - stats.availableBooks) / stats.totalBooks) * 100) | number:'1.0-0' }}%</span>
            </div>
          </div>
        </section>

      }
    </div>
  `,
  styles: [`
    /* ── Base ──────────────────────────────────────────────────────────────────── */
    .admin-dashboard {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* ── Header ───────────────────────────────────────────────────────────────── */
    .dash-header {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
    }
    .dash-header h1 {
      margin: 0;
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 1.7rem;
    }
    .dash-subtitle { margin: .25rem 0 0; color: var(--bh-ink-light); font-size: .9rem; }

    /* ── Loading ──────────────────────────────────────────────────────────────── */
    .loading-overlay {
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
      padding: 5rem; color: var(--bh-ink-light);
    }

    /* ── KPIs ─────────────────────────────────────────────────────────────────── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 1rem;
    }
    .kpi-card {
      border-radius: 20px; padding: 1.4rem; display: flex; align-items: center;
      gap: 1rem; transition: transform .15s, box-shadow .2s;
    }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.12); }
    .kpi-card.forest   { background: linear-gradient(135deg, #1f4d3a 0%, #2d6a50 100%); color: #fff; }
    .kpi-card.indigo   { background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%); color: #fff; }
    .kpi-card.amber    { background: linear-gradient(135deg, #b45309 0%, #d97706 100%); color: #fff; }
    .kpi-card.rose     { background: linear-gradient(135deg, #be123c 0%, #e11d48 100%); color: #fff; }
    .kpi-card.slate    { background: linear-gradient(135deg, #475569 0%, #64748b 100%); color: #fff; }

    .kpi-icon-wrap {
      width: 3rem; height: 3rem; border-radius: 12px;
      background: rgba(255,255,255,.2);
      display: grid; place-items: center; flex-shrink: 0;
    }
    .kpi-icon-wrap mat-icon { font-size: 1.5rem; width: 1.5rem; height: 1.5rem; }
    .kpi-body { display: flex; flex-direction: column; }
    .kpi-value { font-size: 2.2rem; font-weight: 800; line-height: 1; }
    .kpi-label { font-size: .9rem; font-weight: 600; opacity: .9; margin-top: .15rem; }
    .kpi-sub   { font-size: .78rem; opacity: .7; margin-top: .2rem; }

    /* ── Cards communes ──────────────────────────────────────────────────────── */
    .chart-card, .roles-card, .topbooks-card, .activity-card, .availability-section {
      background: #fff;
      border-radius: 20px;
      padding: 1.5rem;
      border: 1px solid rgba(0,0,0,.07);
      box-shadow: 0 2px 8px rgba(0,0,0,.04);
    }
    .card-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 1.25rem; gap: .5rem;
    }
    .card-header h2 {
      margin: 0; font-family: 'DM Serif Display', Georgia, serif; font-size: 1.15rem;
    }
    .card-subtitle { font-size: .82rem; color: var(--bh-ink-light); }
    .see-all { font-size: .85rem; color: var(--bh-forest); }

    /* ── Ligne 2 ──────────────────────────────────────────────────────────────── */
    .row-two {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 1.5rem;
    }
    @media (max-width: 900px) { .row-two { grid-template-columns: 1fr; } }

    /* ── Bar chart ───────────────────────────────────────────────────────────── */
    .bar-chart {
      display: flex;
      align-items: flex-end;
      gap: .6rem;
      height: 140px;
      padding-bottom: .5rem;
    }
    .month-group {
      display: flex; flex-direction: column; align-items: center; gap: .35rem; flex: 1;
    }
    .bars { display: flex; align-items: flex-end; gap: 2px; }
    .bar {
      width: 14px; border-radius: 4px 4px 0 0;
      display: flex; align-items: flex-start; justify-content: center;
      position: relative; min-height: 6px;
      transition: opacity .2s;
    }
    .bar:hover { opacity: .75; }
    .bar-val {
      font-size: .6rem; color: #fff; position: absolute; top: 3px;
      writing-mode: vertical-rl; transform: rotate(180deg);
      opacity: 0; transition: opacity .2s;
    }
    .bar:hover .bar-val { opacity: 1; }
    .loans-bar  { background: var(--bh-forest); }
    .returns-bar { background: #94a3b8; }
    .month-label { font-size: .75rem; color: var(--bh-ink-light); }
    .chart-legend { display: flex; align-items: center; gap: 1rem; margin-top: .75rem; font-size: .82rem; }
    .legend-dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
    .loans-dot   { background: var(--bh-forest); }
    .returns-dot { background: #94a3b8; }

    /* ── Donut ───────────────────────────────────────────────────────────────── */
    .donut-wrap { display: flex; align-items: center; gap: 1.5rem; }
    .donut { width: 140px; height: 140px; flex-shrink: 0; transform: rotate(-90deg); }
    .donut-ring {
      fill: none; stroke-width: 18;
      stroke-linecap: round;
      transition: stroke-dashoffset .4s ease;
    }
    .donut-center-val {
      font-size: 22px; font-weight: 800; fill: var(--bh-ink);
      transform: rotate(90deg); transform-origin: center;
    }
    .donut-center-label {
      font-size: 10px; fill: var(--bh-ink-light);
      transform: rotate(90deg); transform-origin: center;
    }
    .donut-legend { display: flex; flex-direction: column; gap: .6rem; }
    .donut-leg-item { display: flex; align-items: center; gap: .5rem; font-size: .88rem; }
    .donut-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .leg-role { flex: 1; }
    .leg-count { font-weight: 700; }

    /* ── Ligne 3 ──────────────────────────────────────────────────────────────── */
    .row-three {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 800px) { .row-three { grid-template-columns: 1fr; } }

    /* ── Top books ───────────────────────────────────────────────────────────── */
    .topbooks-list { display: flex; flex-direction: column; gap: .6rem; }
    .topbook-row {
      display: flex; align-items: center; gap: .75rem;
      padding: .5rem .6rem; border-radius: 10px;
      transition: background .15s;
    }
    .topbook-row:hover { background: rgba(0,0,0,.03); }
    .book-rank {
      width: 1.6rem; height: 1.6rem; border-radius: 50%;
      background: #f1f5f9; color: var(--bh-ink-light);
      display: grid; place-items: center; font-size: .78rem; font-weight: 700;
      flex-shrink: 0;
    }
    .book-rank.top3 { background: var(--bh-amber); color: #fff; }
    .book-info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
    .book-title { font-size: .9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .book-author { font-size: .78rem; color: var(--bh-ink-light); }
    .book-bar-wrap { flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; }
    .book-bar { height: 100%; background: var(--bh-forest); border-radius: 3px; }
    .book-count { font-size: .82rem; font-weight: 700; white-space: nowrap; }
    .book-count small { font-weight: 400; color: var(--bh-ink-light); font-size: .72rem; }

    /* ── Activity feed ───────────────────────────────────────────────────────── */
    .activity-feed { display: flex; flex-direction: column; gap: .5rem; }
    .activity-item { display: flex; align-items: center; gap: .75rem; padding: .5rem; border-radius: 10px; }
    .activity-item:hover { background: rgba(0,0,0,.02); }
    .activity-icon {
      width: 2.2rem; height: 2.2rem; border-radius: 10px;
      display: grid; place-items: center; flex-shrink: 0;
    }
    .activity-icon mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .act-loan        { background: #dcfce7; color: #15803d; }
    .act-return      { background: #f1f5f9; color: #475569; }
    .act-register    { background: #ede9fe; color: #5b21b6; }
    .act-reservation { background: #fef3c7; color: #92400e; }
    .activity-text { display: flex; flex-direction: column; flex: 1; min-width: 0; font-size: .88rem; }
    .activity-text strong { font-size: .9rem; }
    .activity-text span { color: var(--bh-ink-light); font-size: .82rem; }
    .activity-date { font-size: .78rem; color: var(--bh-ink-light); flex-shrink: 0; }

    /* ── Availability ─────────────────────────────────────────────────────────── */
    .avail-bars { display: flex; flex-direction: column; gap: .85rem; }
    .avail-item { display: flex; align-items: center; gap: .75rem; }
    .avail-label { width: 170px; font-size: .87rem; flex-shrink: 0; }
    .avail-track {
      flex: 1; height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden;
    }
    .avail-fill {
      height: 100%; border-radius: 5px;
      transition: width .5s ease;
    }
    .avail-fill.green  { background: linear-gradient(90deg, #22c55e, #4ade80); }
    .avail-fill.amber  { background: linear-gradient(90deg, #d97706, #fbbf24); }
    .avail-fill.rose   { background: linear-gradient(90deg, #e11d48, #fb7185); }
    .avail-fill.forest { background: linear-gradient(90deg, #1f4d3a, #2d6a50); }
    .avail-pct { width: 80px; text-align: right; font-size: .85rem; font-weight: 600; flex-shrink: 0; }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly dashService = inject(AdminDashboardService);

  readonly loading = signal(true);
  readonly s: Signal<AdminDashboardStats | null> = this.dashService.dashStats as Signal<AdminDashboardStats | null>;

  readonly today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  ngOnInit(): void {
    this.dashService.loadDashboardStats().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  reload(): void {
    this.loading.set(true);
    this.dashService.loadDashboardStats().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  barHeight(val: number, months: { loans: number; returns: number }[]): number {
    const max = Math.max(...months.map((m) => Math.max(m.loans, m.returns)));
    return max > 0 ? Math.max(6, (val / max) * 120) : 6;
  }

  donutSegments(roles: { role: string; count: number }[]) {
    const colors = ['#1f4d3a', '#6366f1', '#f59e0b'];
    const total = roles.reduce((s, r) => s + r.count, 0);
    const circumference = 2 * Math.PI * 45; // r=45
    let offset = 0;
    return roles.map((r, i) => {
      const pct = r.count / total;
      const dash = `${pct * circumference} ${circumference}`;
      const seg = { ...r, color: colors[i], dash, offset: -offset * circumference / total * total };
      offset += r.count;
      return seg;
    });
  }

  activityIcon(type: string): string {
    return { loan: 'menu_book', return: 'assignment_return', register: 'person_add', reservation: 'bookmark' }[type] ?? 'circle';
  }

  activityLabel(type: string, bookTitle?: string): string {
    const book = bookTitle ? `"${bookTitle}"` : '';
    return {
      loan: `a emprunté ${book}`,
      return: `a retourné ${book}`,
      register: 'vient de s\'inscrire',
      reservation: `a réservé ${book}`,
    }[type] ?? '';
  }
}