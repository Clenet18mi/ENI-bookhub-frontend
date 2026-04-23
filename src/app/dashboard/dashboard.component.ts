import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <section class="dashboard-page">
      <header class="hero">
        <div>
          <p class="eyebrow">Dashboard</p>
          <h1>Bienvenue sur BookHub</h1>
          <p class="lead">Votre espace lecteur pour suivre les emprunts, réservations et alertes.</p>
        </div>
      </header>

      <div class="grid">
        <mat-card>
          <mat-card-content>
            <mat-icon>menu_book</mat-icon>
            <strong>3</strong>
            <span>Emprunts en cours</span>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content>
            <mat-icon>bookmark</mat-icon>
            <strong>1</strong>
            <span>Réservation active</span>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content>
            <mat-icon>warning_amber</mat-icon>
            <strong>1</strong>
            <span>Retard en cours</span>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card>
        <mat-card-content>
          <p>Accédez au catalogue, gérez vos réservations et consultez vos échéances.</p>
          <button mat-flat-button color="primary">Voir le catalogue</button>
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: [
    `
      .dashboard-page { display: grid; gap: 1.25rem; }
      .hero { padding: 1.5rem; border-radius: var(--bh-radius-lg); background: linear-gradient(135deg, rgba(31,77,58,.1), rgba(184,92,0,.08)), #fff; border: 1px solid rgba(26,26,26,.06); }
      .eyebrow { margin: 0 0 .35rem; text-transform: uppercase; letter-spacing: .12em; font-size: .78rem; color: var(--bh-forest-mid); }
      h1 { margin: 0; font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(2rem, 4vw, 3.2rem); }
      .lead { margin: .75rem 0 0; color: var(--bh-ink-mid); }
      .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
      mat-card-content { display: grid; gap: .5rem; justify-items: start; }
      mat-icon { color: var(--bh-forest); }
      strong { font-size: 2rem; }
      span, p { color: var(--bh-ink-mid); }
      @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class DashboardComponent {}
