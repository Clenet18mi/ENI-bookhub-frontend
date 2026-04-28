import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReservationsService } from '../reservations/reservations.service';
import { ReservationItem } from '../reservations/reservation.model';
import { BookService, BookDTO } from '../books/book.service';
import { SlicePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

/**
 * Page catalogue — version connectée au backend.
 *
 * Intègre le bouton « Réserver » (US-RESA-01) :
 *  - visible uniquement si availableCopies === 0
 *  - désactivé (avec badge "Déjà réservé") si l'utilisateur a déjà une réservation active
 *  - appel POST /api/reservations
 *  - affichage du rang retourné par le backend
 */
@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule, MatCardModule, MatChipsModule, MatDialogModule,
    MatFormFieldModule, MatIconModule, MatInputModule,
    MatProgressSpinnerModule, MatSelectModule, MatSnackBarModule,
    MatTooltipModule,
    SlicePipe,
  ],
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.scss',
})
export class CatalogueComponent implements OnInit {

  private readonly reservationsService = inject(ReservationsService);
  private readonly bookService = inject(BookService);
  private readonly snackBar = inject(MatSnackBar);

  readonly books = signal<BookDTO[]>([]);
  readonly loading = signal(true);
  readonly reserving = signal<number | null>(null);

  /**
   * Set des bookId pour lesquels l'utilisateur a déjà une réservation active
   * (status PENDING ou AVAILABLE). Chargé en même temps que le catalogue.
   */
  readonly reservedBookIds = signal<Set<number>>(new Set());

  query = '';
  category = 'all';
  availability = 'all';
  sortBy = 'featured';

  // ── Stats calculées ────────────────────────────────────────────────────────
  readonly totalBooks = () => this.books().length;
  readonly availableBooks = () => this.books().filter(b => b.availableCopies > 0).length;
  readonly unavailableBooks = () => this.books().filter(b => b.availableCopies === 0).length;
  readonly categories = () => [...new Set(this.books().map(b => b.category).filter(Boolean))] as string[];

  ngOnInit(): void {
    // Charge livres ET réservations en parallèle pour savoir lesquels sont déjà réservés
    forkJoin({
      books: this.bookService.getBooks(),
      reservations: this.reservationsService.getMyReservations(),
    }).subscribe({
      next: ({ books, reservations }) => {
        this.books.set(books);

        // Construire le set des bookId déjà réservés (statuts actifs uniquement)
        const activeStatuses = new Set(['PENDING', 'AVAILABLE']);
        const ids = new Set(
          reservations
            .filter((r: ReservationItem) => activeStatuses.has(r.status))
            .map((r: ReservationItem) => r.bookId)
        );
        this.reservedBookIds.set(ids);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  get filteredBooks(): () => BookDTO[] {
    return () => {
      const q = this.query.trim().toLowerCase();
      let list = this.books().filter(book => {
        const matchQ = !q || [book.title, book.author, book.isbn ?? '']
          .some(v => v.toLowerCase().includes(q));
        const matchCat = this.category === 'all' || book.category === this.category;
        const matchAvail = this.availability === 'all'
          || (this.availability === 'available' && book.availableCopies > 0)
          || (this.availability === 'unavailable' && book.availableCopies === 0);
        return matchQ && matchCat && matchAvail;
      });

      if (this.sortBy === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
      if (this.sortBy === 'rating') list = [...list].sort((a, b) => b.averageRating - a.averageRating);
      return list;
    };
  }

  isAvailable(book: BookDTO): boolean {
    return book.availableCopies > 0;
  }

  /** Retourne true si l'utilisateur a déjà une réservation active sur ce livre */
  isAlreadyReserved(book: BookDTO): boolean {
    return this.reservedBookIds().has(book.id);
  }

  /** US-RESA-01 : réserver un livre indisponible */
  reserve(book: BookDTO): void {
    if (this.isAlreadyReserved(book)) return;

    this.reserving.set(book.id);
    this.reservationsService.createReservation(book.id).subscribe({
      next: (res) => {
        this.reserving.set(null);
        // Mettre à jour localement pour refléter immédiatement le changement
        this.reservedBookIds.update(ids => new Set([...ids, book.id]));
        this.snackBar.open(
          `Réservation confirmée ! Vous êtes n°${res.rank} dans la file d'attente.`,
          'Fermer',
          { duration: 5000, panelClass: ['snack-success'] }
        );
      },
      error: (err) => {
        this.reserving.set(null);
        const msg = err?.error?.detail ?? 'Impossible de réserver ce livre. Réessayez.';
        this.snackBar.open(msg, 'Fermer', { duration: 5000, panelClass: ['snack-error'] });
      },
    });
  }

  resetFilters(): void {
    this.query = '';
    this.category = 'all';
    this.availability = 'all';
    this.sortBy = 'featured';
  }
}
