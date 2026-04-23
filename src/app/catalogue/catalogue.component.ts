import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReservationDialogComponent } from './reservation-dialog.component';
import { ReservationSuccessDialogComponent } from './reservation-success-dialog.component';
import { ReservationBookSummary, ReservationBookStatus, ReservationService } from './reservation.service';

type BookCard = ReservationBookSummary & {
  rating: number;
  summary: string;
};

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatCardModule, MatChipsModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  template: `
    <section class="catalogue-page">
      <header class="hero">
        <div>
          <p class="eyebrow">Catalogue BookHub</p>
          <h1>Explorer, réserver et lire plus facilement.</h1>
          <p class="lead">Parcourez le fonds, filtrez par disponibilité et réservez un livre selon le créneau proposé.</p>
        </div>

        <div class="hero-stats">
          <div><strong>128</strong><span>livres visibles</span></div>
          <div><strong>86</strong><span>disponibles</span></div>
          <div><strong>12</strong><span>réservables</span></div>
        </div>
      </header>

      <section class="filters" aria-label="Filtres du catalogue">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher un livre</mat-label>
          <input matInput [(ngModel)]="query" placeholder="Titre, auteur, mot-clé" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline"><mat-label>Catégorie</mat-label><mat-select [(ngModel)]="category"><mat-option value="all">Toutes</mat-option>@for (item of categories; track item) {<mat-option [value]="item">{{ item }}</mat-option>}</mat-select></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Disponibilité</mat-label><mat-select [(ngModel)]="availability"><mat-option value="all">Toutes</mat-option><mat-option value="available">Disponibles</mat-option><mat-option value="loaned">Empruntés</mat-option><mat-option value="reserved">Réservés</mat-option></mat-select></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Trier</mat-label><mat-select [(ngModel)]="sortBy"><mat-option value="featured">Mis en avant</mat-option><mat-option value="title">Titre</mat-option><mat-option value="rating">Note</mat-option></mat-select></mat-form-field>
      </section>

      <section class="chips-bar">
        @for (chip of quickFilters; track chip) {
          <button mat-stroked-button type="button">{{ chip }}</button>
        }
      </section>

      <section class="results-head">
        <div>
          <h2>Résultats</h2>
          <p>{{ filteredBooks.length }} livre(s) correspondant à votre recherche.</p>
        </div>
        <button mat-button type="button" (click)="resetFilters()"><mat-icon>filter_alt_off</mat-icon> Réinitialiser</button>
      </section>

      <section class="book-list">
        @for (book of filteredBooks; track book.title) {
          <mat-card class="book-card">
            <div class="cover" aria-hidden="true"><mat-icon>auto_stories</mat-icon></div>
            <div class="book-body">
              <div class="book-top">
                <div>
                  <h3>{{ book.title }}</h3>
                  <p>{{ book.author }}</p>
                </div>
                <span class="rating"><mat-icon>star</mat-icon>{{ book.rating.toFixed(1) }}</span>
              </div>
              <mat-chip>{{ book.category }}</mat-chip>
              <p class="summary">{{ book.summary }}</p>
              <div class="status-row">
                <span class="status" [class]="book.status">{{ statusLabel(book.status) }}</span>
                @if (book.status !== 'available') {<span class="meta">Retour estimé : {{ book.nextAvailable }}</span>}
              </div>
                <div class="actions">
                  <button mat-flat-button color="primary" type="button" (click)="openReservation(book)"><mat-icon>bookmark_add</mat-icon> Réserver</button>
                  @if (book.status !== 'available') {
                    <button mat-stroked-button disabled><mat-icon>schedule</mat-icon>{{ book.queue }}</button>
                  }
                </div>
            </div>
          </mat-card>
        }
      </section>

      <footer class="pager">
        <button mat-stroked-button disabled>Précédent</button>
        <span>Page 1 sur 3</span>
        <button mat-stroked-button>Suivant</button>
      </footer>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .catalogue-page { display: grid; gap: 1.25rem; }
      .hero { display: flex; justify-content: space-between; gap: 1rem; align-items: end; padding: 1.5rem; border-radius: var(--bh-radius-lg); background: linear-gradient(135deg, rgba(31,77,58,.1), rgba(184,92,0,.08)), #fff; border: 1px solid rgba(26,26,26,.06); }
      .eyebrow { margin: 0 0 .35rem; text-transform: uppercase; letter-spacing: .12em; font-size: .78rem; color: var(--bh-forest-mid); }
      h1 { margin: 0; font-family: 'DM Serif Display', Georgia, serif; font-size: clamp(2rem, 4vw, 3.4rem); }
      .lead, .results-head p, .summary, .meta, .book-top p, .hero-stats span { color: var(--bh-ink-mid); }
      .hero-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .75rem; }
      .hero-stats > div { padding: 1rem; border-radius: var(--bh-radius-md); background: rgba(255,255,255,.75); border: 1px solid rgba(26,26,26,.08); min-width: 110px; }
      .hero-stats strong { display: block; font-size: 1.6rem; }
      .filters { display: grid; grid-template-columns: 1.5fr repeat(3, minmax(0, 1fr)); gap: .9rem; align-items: start; }
      .search-field { grid-column: 1 / -1; }
      .chips-bar { display: flex; flex-wrap: wrap; gap: .75rem; }
      .results-head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
      .results-head h2 { margin: 0; font-family: 'DM Serif Display', Georgia, serif; }
      .book-list { display: grid; gap: 1rem; }
      .book-card { display: grid; grid-template-columns: 5rem 1fr; gap: 1rem; padding: 1rem; border-radius: var(--bh-radius-lg); }
      .cover { width: 5rem; height: 7rem; border-radius: .95rem; background: linear-gradient(180deg, var(--bh-paper-mid), #fff); display: grid; place-items: center; color: var(--bh-forest-mid); }
      .book-body { display: grid; gap: .75rem; }
      .book-top { display: flex; justify-content: space-between; gap: 1rem; align-items: start; }
      .book-top h3 { margin: 0; font-size: 1.05rem; }
      .rating { display: inline-flex; align-items: center; gap: .25rem; font-weight: 700; color: var(--bh-amber); }
      .summary { margin: 0; line-height: 1.6; }
      .status-row, .actions { display: flex; flex-wrap: wrap; gap: .75rem; align-items: center; }
      .status { padding: .45rem .75rem; border-radius: 999px; font-weight: 700; font-size: .85rem; }
      .available { background: var(--bh-forest-pale); color: var(--bh-forest); }
      .loaned { background: #fff3da; color: #8a5a00; }
      .reserved { background: #f2ebff; color: #5d3bb0; }
      .pager { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
      @media (max-width: 960px) { .hero, .results-head { display: grid; } .filters { grid-template-columns: 1fr; } .book-card { grid-template-columns: 1fr; } .cover { width: 4.5rem; height: 6.5rem; } .hero-stats { grid-template-columns: 1fr 1fr 1fr; } }
      @media (max-width: 640px) { .hero, .pager { padding: 1rem; } .hero-stats { grid-template-columns: 1fr; } .results-head button { justify-self: start; } }
    `,
  ],
})
export class CatalogueComponent {
  private readonly reservationService = inject(ReservationService);
  private readonly dialog = inject(MatDialog);

  query = '';
  category = 'all';
  availability = 'all';
  sortBy = 'featured';

  readonly categories = ['Roman', 'Jeunesse', 'Policier', 'BD', 'Essai'];
   readonly quickFilters = ['Disponibles seulement', 'Nouveautés', 'Les mieux notés', 'Réservation simple'];

  readonly books: BookCard[] = [
    { title: 'Le Chant des forêts', author: 'M. Durand', category: 'Roman', rating: 4.8, status: 'loaned', summary: 'Un roman sensible sur la transmission, les saisons et la mémoire collective du quartier.', nextAvailable: '2026-05-10', queue: '3 réservations' },
    { title: 'Atlas des histoires', author: 'J. Lefevre', category: 'Essai', rating: 4.5, status: 'reserved', summary: 'Une exploration des récits qui façonnent la culture populaire et les bibliothèques vivantes.', nextAvailable: '2026-05-12', queue: '1 réservation' },
    { title: 'La Ville invisible', author: 'S. Cohen', category: 'Policier', rating: 4.2, status: 'available', summary: 'Une enquête immersive dans les rues et archives d’une ville qui semble changer la nuit.' },
    { title: 'Carnet de lecture', author: 'L. Martin', category: 'BD', rating: 4.6, status: 'available', summary: 'Carnet graphique pour suivre ses lectures, ses notes et ses recommandations personnelles.' },
  ];

  get filteredBooks(): BookCard[] {
    const normalizedQuery = this.query.trim().toLowerCase();
    const filtered = this.books.filter((book) => {
      const matchesQuery = !normalizedQuery || [book.title, book.author, book.category, book.summary].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesCategory = this.category === 'all' || book.category === this.category;
      const matchesAvailability = this.availability === 'all' || book.status === this.availability;
      return matchesQuery && matchesCategory && matchesAvailability;
    });

    if (this.sortBy === 'title') {
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    if (this.sortBy === 'rating') {
      return [...filtered].sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }

  openReservation(book: BookCard): void {
    const suggested = this.reservationService.getSuggestedReservationDates(book);
    const preview = this.reservationService.buildPreview(book, suggested.startDate, suggested.endDate);

    const dialogRef = this.dialog.open(ReservationDialogComponent, {
      data: { book, preview },
    });

    dialogRef.afterClosed().subscribe((formValue) => {
      if (!formValue) {
        return;
      }

      const reservation = this.reservationService.createReservation({
        bookTitle: book.title,
        bookAuthor: book.author,
        category: book.category,
        requestedStartDate: formValue.startDate,
        requestedEndDate: formValue.endDate,
      });

      this.dialog.open(ReservationSuccessDialogComponent, { data: reservation });
    });
  }

  resetFilters(): void {
    this.query = '';
    this.category = 'all';
    this.availability = 'all';
    this.sortBy = 'featured';
  }

  statusLabel(status: ReservationBookStatus): string {
    switch (status) {
      case 'available': return 'Disponible';
      case 'loaned': return 'Emprunté';
      case 'reserved': return 'Réservé';
    }
  }
}
