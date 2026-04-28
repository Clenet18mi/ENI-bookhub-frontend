import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Book } from '../core/models/book.model';
import { BookService } from '../core/services/book.service';
import { ReservationDialogComponent } from './reservation-dialog.component';
import { ReservationSuccessDialogComponent } from './reservation-success-dialog.component';
import { ReservationBookStatus, ReservationBookSummary, ReservationService } from './reservation.service';

type BookCard = ReservationBookSummary & {
  id?: number;
  rating: number;
  summary: string;
};

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <section class="catalogue-page">
      <header class="catalogue-topbar">
        <a routerLink="/" class="brand-link">
          <div class="brand-mark">B</div>
          <div>
            <div class="brand-name">Book<span>Hub</span></div>
            <div class="brand-tag">Bibliothèque communautaire</div>
          </div>
        </a>

        <div class="topbar-actions">
          <a mat-button routerLink="/">Accueil</a>
          <a mat-stroked-button routerLink="/login">Connexion</a>
        </div>
      </header>

      <header class="hero">
        <div>
          <p class="eyebrow">Catalogue BookHub</p>
          <h1>Explorer, réserver et lire plus facilement.</h1>
          <p class="lead">
            Parcourez le fonds, filtrez par disponibilité et réservez un livre selon le créneau proposé.
          </p>
        </div>

        <div class="hero-stats">
          <div><strong>{{ books.length }}</strong><span>livres visibles</span></div>
          <div><strong>{{ availableCount }}</strong><span>disponibles</span></div>
          <div><strong>{{ unavailableCount }}</strong><span>réservables</span></div>
        </div>
      </header>

      <section class="filters" aria-label="Filtres du catalogue">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Rechercher un livre</mat-label>
          <input
            matInput
            [(ngModel)]="query"
            (ngModelChange)="loadBooks()"
            placeholder="Titre, auteur, ISBN"
          />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Catégorie</mat-label>
          <mat-select [(ngModel)]="category" (selectionChange)="loadBooks()">
            <mat-option value="all">Toutes</mat-option>
            @for (item of categories; track item) {
              <mat-option [value]="item">{{ item }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Disponibilité</mat-label>
          <mat-select [(ngModel)]="availability" (selectionChange)="loadBooks()">
            <mat-option value="all">Toutes</mat-option>
            <mat-option value="available">Disponibles</mat-option>
            <mat-option value="loaned">Indisponibles</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Trier</mat-label>
          <mat-select [(ngModel)]="sortBy" (selectionChange)="loadBooks()">
            <mat-option value="featured">A → Z</mat-option>
            <mat-option value="title_desc">Z → A</mat-option>
            <mat-option value="rating_desc">Meilleures notes</mat-option>
            <mat-option value="rating_asc">Notes croissantes</mat-option>
            <mat-option value="date_desc">Plus récents</mat-option>
            <mat-option value="date_asc">Plus anciens</mat-option>
          </mat-select>
        </mat-form-field>
      </section>

      <section class="results-head">
        <div>
          <h2>Résultats</h2>
          <p>{{ books.length }} livre(s) correspondant à votre recherche.</p>
        </div>

        <button mat-button type="button" (click)="resetFilters()">
          <mat-icon>filter_alt_off</mat-icon>
          Réinitialiser
        </button>
      </section>

      <section class="book-list">
        @for (book of books; track book.id ?? book.title) {
          <mat-card class="book-card">
            <div class="cover" aria-hidden="true">
              <mat-icon>auto_stories</mat-icon>
            </div>

            <div class="book-body">
              <div class="book-top">
                <div>
                  <h3>{{ book.title }}</h3>
                  <p>{{ book.author }}</p>
                </div>

                <span class="rating">
                  <mat-icon>star</mat-icon>
                  {{ book.rating.toFixed(1) }}
                </span>
              </div>

              <mat-chip>{{ book.category }}</mat-chip>
              <p class="summary">{{ book.summary }}</p>

              <div class="status-row">
                <span class="status" [class]="book.status">
                  {{ statusLabel(book.status) }}
                </span>

                @if (book.status !== 'available') {
                  <span class="meta">Retour estimé : {{ book.nextAvailable }}</span>
                }
              </div>

              <div class="actions">
                <button mat-flat-button color="primary" type="button" (click)="openReservation(book)">
                  <mat-icon>bookmark_add</mat-icon>
                  Réserver
                </button>

                @if (book.status !== 'available') {
                  <button mat-stroked-button disabled>
                    <mat-icon>schedule</mat-icon>
                    {{ book.queue }}
                  </button>
                }
              </div>
            </div>
          </mat-card>
        }
      </section>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .catalogue-page {
      min-height: 100vh;
      display: grid;
      gap: 1.25rem;
      padding: 2rem;
      background:
        radial-gradient(circle at top right, rgba(31,77,58,.12), transparent 28%),
        linear-gradient(135deg, #faf8f4 0%, #f4efe6 100%);
    }

    .catalogue-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: inherit;
      text-decoration: none;
    }

    .brand-mark {
      width: 3rem;
      height: 3rem;
      border-radius: 1rem;
      background: var(--bh-forest);
      color: #fff;
      display: grid;
      place-items: center;
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 1.4rem;
    }

    .brand-name {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 1.7rem;
      line-height: 1;
    }

    .brand-name span {
      color: var(--bh-amber);
    }

    .brand-tag {
      color: var(--bh-ink-light);
      font-size: .9rem;
    }

    .topbar-actions {
      display: flex;
      gap: .75rem;
      align-items: center;
    }

    .hero {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: end;
      padding: 1.5rem;
      border-radius: var(--bh-radius-lg);
      background: linear-gradient(135deg, rgba(31,77,58,.1), rgba(184,92,0,.08)), #fff;
      border: 1px solid rgba(26,26,26,.06);
    }

    .eyebrow {
      margin: 0 0 .35rem;
      text-transform: uppercase;
      letter-spacing: .12em;
      font-size: .78rem;
      color: var(--bh-forest-mid);
    }

    h1 {
      margin: 0;
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: clamp(2rem, 4vw, 3.4rem);
    }

    .lead,
    .results-head p,
    .summary,
    .meta,
    .book-top p,
    .hero-stats span {
      color: var(--bh-ink-mid);
    }

    .hero-stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: .75rem;
    }

    .hero-stats > div {
      padding: 1rem;
      border-radius: var(--bh-radius-md);
      background: rgba(255,255,255,.75);
      border: 1px solid rgba(26,26,26,.08);
      min-width: 110px;
    }

    .hero-stats strong {
      display: block;
      font-size: 1.6rem;
    }

    .filters {
      display: grid;
      grid-template-columns: 1.5fr repeat(3, minmax(0, 1fr));
      gap: .9rem;
      align-items: start;
    }

    .search-field {
      grid-column: 1 / -1;
    }

    .results-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .results-head h2 {
      margin: 0;
      font-family: 'DM Serif Display', Georgia, serif;
    }

    .book-list {
      display: grid;
      gap: 1rem;
    }

    .book-card {
      display: grid;
      grid-template-columns: 5rem 1fr;
      gap: 1rem;
      padding: 1rem;
      border-radius: var(--bh-radius-lg);
    }

    .cover {
      width: 5rem;
      height: 7rem;
      border-radius: .95rem;
      background: linear-gradient(180deg, var(--bh-paper-mid), #fff);
      display: grid;
      place-items: center;
      color: var(--bh-forest-mid);
    }

    .book-body {
      display: grid;
      gap: .75rem;
    }

    .book-top {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: start;
    }

    .book-top h3 {
      margin: 0;
      font-size: 1.05rem;
    }

    .rating {
      display: inline-flex;
      align-items: center;
      gap: .25rem;
      font-weight: 700;
      color: var(--bh-amber);
    }

    .summary {
      margin: 0;
      line-height: 1.6;
    }

    .status-row,
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: .75rem;
      align-items: center;
    }

    .status {
      padding: .45rem .75rem;
      border-radius: 999px;
      font-weight: 700;
      font-size: .85rem;
    }

    .available {
      background: var(--bh-forest-pale);
      color: var(--bh-forest);
    }

    .loaned {
      background: #fff3da;
      color: #8a5a00;
    }

    .reserved {
      background: #f2ebff;
      color: #5d3bb0;
    }

    @media (max-width: 960px) {
      .catalogue-page {
        padding: 1rem;
      }

      .catalogue-topbar,
      .hero,
      .results-head {
        display: grid;
      }

      .filters {
        grid-template-columns: 1fr;
      }

      .book-card {
        grid-template-columns: 1fr;
      }

      .cover {
        width: 4.5rem;
        height: 6.5rem;
      }

      .hero-stats {
        grid-template-columns: 1fr 1fr 1fr;
      }
    }

    @media (max-width: 640px) {
      .hero {
        padding: 1rem;
      }

      .hero-stats {
        grid-template-columns: 1fr;
      }

      .results-head button {
        justify-self: start;
      }
    }
  `],
})
export class CatalogueComponent implements OnInit {
  private readonly reservationService = inject(ReservationService);
  private readonly dialog = inject(MatDialog);
  private readonly bookService = inject(BookService);
  private readonly cdr = inject(ChangeDetectorRef);

  query = '';
  category = 'all';
  availability = 'all';
  sortBy = 'featured';

  readonly categories = ['Fantasy', 'Science-fiction', 'Classique', 'Dystopie', 'Informatique', 'Jeunesse'];

  books: BookCard[] = [];

  get availableCount(): number {
    return this.books.filter((book) => book.status === 'available').length;
  }

  get unavailableCount(): number {
    return this.books.filter((book) => book.status === 'loaned').length;
  }

  ngOnInit(): void {
    this.loadBooks();
  }

  // Charge les livres depuis le backend selon les filtres sélectionnés
  loadBooks(): void {
    this.bookService.searchBooks({
      query: this.query.trim() || undefined,
      category: this.category !== 'all' ? this.category : undefined,
      available: this.mapAvailability(),
      sort: this.mapSort(),
    }).subscribe({
      next: (response: Book[] | { content?: Book[] }) => {
        const books = Array.isArray(response) ? response : response.content ?? [];

        this.books = books.map((book) => this.toBookCard(book));

        // Force Angular à rafraîchir l'affichage après la réponse HTTP
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des livres', error);
      },
    });
  }

  // Convertit un BookDTO backend en format utilisé par la carte du catalogue
  private toBookCard(book: Book): BookCard {
    const availableCopies = book.availableCopies ?? 0;

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category ?? 'Non catégorisé',
      rating: Number(book.averageRating ?? 0),
      status: availableCopies > 0 ? 'available' : 'loaned',
      summary: book.description ?? 'Description non disponible',
      nextAvailable: availableCopies > 0 ? undefined : 'Date à confirmer',
      queue: availableCopies > 0 ? undefined : 'Réservation possible',
    };
  }

  // Transforme le filtre d'affichage en booléen attendu par le backend
  private mapAvailability(): boolean | undefined {
    if (this.availability === 'available') {
      return true;
    }

    if (this.availability === 'loaned') {
      return false;
    }

    return undefined;
  }

  // Transforme le tri sélectionné en valeur comprise par le backend
  private mapSort(): string | undefined {
    switch (this.sortBy) {
      case 'title_desc':
        return 'title_desc';
      case 'rating_desc':
        return 'rating_desc';
      case 'rating_asc':
        return 'rating_asc';
      case 'date_desc':
        return 'date_desc';
      case 'date_asc':
        return 'date_asc';
      default:
        return undefined;
    }
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
    this.loadBooks();
  }

  statusLabel(status: ReservationBookStatus): string {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'loaned':
        return 'Indisponible';
      case 'reserved':
        return 'Réservé';
    }
  }
}
