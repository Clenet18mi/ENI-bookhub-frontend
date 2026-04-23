import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <section class="dashboard-page">
      <header class="hero-card">
        <div>
          <p class="eyebrow">Tableau de bord</p>
          <h1>Bienvenue dans votre espace BookHub.</h1>
          <p class="lead">Suivez vos prêts, vos réservations et vos priorités de lecture depuis un seul endroit.</p>
        </div>

        <div class="hero-actions">
          <a mat-flat-button color="primary" routerLink="/profile"><mat-icon>person</mat-icon> Gérer mon compte</a>
          <button mat-stroked-button type="button"><mat-icon>bookmark</mat-icon> Voir mes réservations</button>
        </div>
      </header>

      <section class="stats-grid">
        @for (stat of stats; track stat.label) {
          <mat-card class="stat-card">
            <mat-icon>{{ stat.icon }}</mat-icon>
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </mat-card>
        }
      </section>

      <section class="overview-grid">
        <mat-card class="panel-card">
          <div class="panel-head">
            <h2>À faire aujourd'hui</h2>
            <button mat-button type="button">Tout voir</button>
          </div>
          <ul>
            @for (item of tasks; track item) {
              <li><mat-icon>check_circle</mat-icon><span>{{ item }}</span></li>
            }
          </ul>
        </mat-card>

        <mat-card class="panel-card panel-card-compact">
          <h2>Raccourcis</h2>
          <div class="shortcut-list">
            @for (shortcut of shortcuts; track shortcut.label) {
              <button mat-stroked-button type="button">
                <mat-icon>{{ shortcut.icon }}</mat-icon>
                <span>{{ shortcut.label }}</span>
              </button>
            }
          </div>
        </mat-card>
      </section>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .dashboard-page { display: grid; gap: 1rem; }
      .hero-card { display: flex; justify-content: space-between; gap: 1rem; align-items: end; padding: 1.5rem; border-radius: 24px; background: linear-gradient(135deg, rgba(31,77,58,.1), rgba(184,92,0,.08)), #fff; border: 1px solid rgba(26,26,26,.06); }
      .eyebrow { margin: 0 0 .35rem; text-transform: uppercase; letter-spacing: .12em; font-size: .78rem; color: var(--bh-forest-mid); }
      h1 { margin: 0; font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(2rem, 4vw, 3.2rem); }
      .lead { margin: .5rem 0 0; color: var(--bh-ink-mid); max-width: 58ch; line-height: 1.6; }
      .hero-actions { display: flex; flex-wrap: wrap; gap: .75rem; }
      .stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .85rem; }
      .stat-card { padding: 1rem; display: grid; gap: .4rem; border-radius: 20px; }
      .stat-card mat-icon { color: var(--bh-forest); }
      .stat-card strong { font-size: 1.9rem; }
      .stat-card span { color: var(--bh-ink-mid); }
      .overview-grid { display: grid; grid-template-columns: 1.3fr .9fr; gap: 1rem; }
      .panel-card { padding: 1.25rem; border-radius: 24px; }
      .panel-head { display: flex; justify-content: space-between; gap: 1rem; align-items: center; }
      .panel-card h2 { margin: 0; font-family: 'DM Serif Display', Georgia, serif; }
      ul { list-style: none; padding: 0; margin: 1rem 0 0; display: grid; gap: .75rem; }
      li { display: flex; align-items: start; gap: .75rem; color: var(--bh-ink-mid); }
      li mat-icon { color: var(--bh-forest); }
      .shortcut-list { display: grid; gap: .75rem; margin-top: 1rem; }
      .shortcut-list button { justify-content: start; padding: .9rem 1rem; border-radius: 16px; }
      .shortcut-list mat-icon { margin-right: .5rem; }
      @media (max-width: 960px) { .hero-card, .overview-grid { display: grid; } .stats-grid { grid-template-columns: 1fr 1fr; } }
      @media (max-width: 640px) { .hero-card { padding: 1rem; } .stats-grid { grid-template-columns: 1fr; } .panel-card { padding: 1rem; } }
    `,
  ],
})
export class DashboardComponent {
  readonly stats = [
    { icon: 'menu_book', value: '128', label: 'livres visibles' },
    { icon: 'bookmark', value: '12', label: 'réservations actives' },
    { icon: 'schedule', value: '4', label: 'prêts à échéance' },
    { icon: 'verified_user', value: '100%', label: 'compte à jour' },
  ];

  readonly tasks = [
    'Relancer une réservation en attente.',
    'Consulter les prêts à rendre cette semaine.',
    'Mettre à jour le profil lecteur.',
  ];

  readonly shortcuts = [
    { icon: 'person', label: 'Mon profil' },
    { icon: 'bookmark', label: 'Mes réservations' },
    { icon: 'history', label: 'Historique' },
  ];
}
