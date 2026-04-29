import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SlicePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { BookService } from '../core/services/book.service';
import { Book } from '../core/models/book.model';
import { ReservationsService } from '../reservations/reservations.service';
import { ReservationItem } from '../reservations/reservation.model';
import { LoansService } from '../loans/services/loans.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
    SlicePipe,
  ],
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.scss',
})
export class CatalogueComponent implements OnInit {

  private readonly bookService         = inject(BookService);
  private readonly reservationsService = inject(ReservationsService);
  private readonly loansService        = inject(LoansService);
  private readonly authService         = inject(AuthService);
  private readonly snackBar            = inject(MatSnackBar);
  private readonly router              = inject(Router);

  // ── État ────────────────────────────────────────────────────────────────
  readonly books     = signal<Book[]>([]);
  readonly loading   = signal(true);
  readonly reserving = signal<number | null>(null);
  readonly loaning   = signal<number | null>(null);

  /** Vrai si l'utilisateur a une session valide */
  isConnected = false;

  /** IDs des livres déjà réservés par l'utilisateur connecté */
  reservedBookIds: Set<number> = new Set();

  /** Nombre d'emprunts en cours */
  currentLoanCount = 0;

  get isMaxloan(): boolean {
    return this.currentLoanCount >= 3;
  }

  // ── Filtres ─────────────────────────────────────────────────────────────
  query        = '';
  category     = 'all';
  availability = 'all';
  sortBy       = 'featured';

  // ── Stats calculées ─────────────────────────────────────────────────────
  readonly totalBooks       = () => this.books().length;
  readonly availableBooks   = () => this.books().filter(b => (b.availableCopies ?? 0) > 0).length;
  readonly unavailableBooks = () => this.books().filter(b => (b.availableCopies ?? 0) === 0).length;
  readonly categories       = () =>
    [...new Set(this.books().map(b => b.category).filter(Boolean))] as string[];

  // ── Rôles ────────────────────────────────────────────────────────────────

  /** Retourne vrai si l'utilisateur connecté est un lecteur (ROLE_USER) */
  isUser(): boolean {
    return this.authService.getRole() === 'ROLE_USER';
  }

  /** Retourne vrai si l'utilisateur connecté est un bibliothécaire (ROLE_LIBRARIAN) */
  isLibrarian(): boolean {
    return this.authService.getRole() === 'ROLE_LIBRARIAN';
  }

  // ── Init ────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.isConnected = this.authService.hasValidSession();
    this.loadAll();
  }

  private loadAll(): void {
    if (this.isConnected) {
      // Connecté : charge livres + réservations + quota en parallèle
      forkJoin({
        books:        this.bookService.getBooks(),
        reservations: this.reservationsService.getMyReservations(),
        loanCount:    this.loansService.getLoanCount(),
      }).subscribe({
        next: ({ books, reservations, loanCount }) => {
          this.books.set(books);
          this.currentLoanCount = loanCount;
          this.reservedBookIds = new Set(
            reservations
              .filter(r => r.status === 'PENDING' || r.status === 'AVAILABLE')
              .map(r => r.bookId)
          );
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      // Non connecté : uniquement les livres (endpoint public)
      this.bookService.getBooks().subscribe({
        next: (list) => { this.books.set(list); this.loading.set(false); },
        error: ()    => this.loading.set(false),
      });
    }
  }

  // ── Filtres / tri ────────────────────────────────────────────────────────
  readonly filteredBooks = (): Book[] => {
    const q = this.query.trim().toLowerCase();
    let list = this.books().filter(book => {
      const matchQ = !q || [book.title, book.author, book.isbn ?? '']
        .some(v => v.toLowerCase().includes(q));
      const matchCat   = this.category === 'all' || book.category === this.category;
      const copies     = book.availableCopies ?? 0;
      const matchAvail =
        this.availability === 'all' ||
        (this.availability === 'available'   && copies > 0) ||
        (this.availability === 'unavailable' && copies === 0);
      return matchQ && matchCat && matchAvail;
    });

    if (this.sortBy === 'title')  list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (this.sortBy === 'rating') list = [...list].sort((a, b) =>
      (b.averageRating ?? 0) - (a.averageRating ?? 0));
    return list;
  };

  isAvailable(book: Book): boolean {
    return (book.availableCopies ?? 0) > 0;
  }

  isAlreadyReserved(book: Book): boolean {
    return book.id !== undefined && this.reservedBookIds.has(book.id);
  }

  resetFilters(): void {
    this.query = '';
    this.category = 'all';
    this.availability = 'all';
    this.sortBy = 'featured';
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  private requireAuth(): boolean {
    if (this.authService.hasValidSession()) return true;
    this.snackBar.open(
      'Vous devez être connecté pour effectuer cette action.',
      'Se connecter',
      { duration: 5000, panelClass: ['snack-warn'] }
    ).onAction().subscribe(() => this.router.navigate(['/login']));
    return false;
  }

  /** Naviguer vers la page d'ajout de livre (bibliothécaire) */
  addBook(): void {
    this.router.navigate(['/admin/books/add']);
  }

  /** US-RESA-01 : réserver un livre indisponible — direct, sans overlay */
  reserve(book: Book): void {
    if (!this.requireAuth()) return;
    if (!book.id) return;

    this.reserving.set(book.id);
    this.reservationsService.createReservation(book.id).subscribe({
      next: (res: ReservationItem) => {
        this.reserving.set(null);
        this.reservedBookIds = new Set([...this.reservedBookIds, book.id!]);
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

  /** Emprunter un livre disponible */
  createLoan(book: Book): void {
    if (!this.requireAuth()) return;
    if (!book.id) return;

    this.loaning.set(book.id);
    this.loansService.createLoan(book.id).subscribe({
      next: () => {
        this.loaning.set(null);
        this.currentLoanCount = Math.min(this.currentLoanCount + 1, 3);
        this.loadAll();
        this.snackBar.open(
          `"${book.title}" a bien été emprunté !`,
          'Fermer',
          { duration: 5000, panelClass: ['snack-success'] }
        );
      },
      error: (err) => {
        this.loaning.set(null);
        const msg = err?.error?.detail ?? 'Impossible d\'emprunter ce livre. Réessayez.';
        this.snackBar.open(msg, 'Fermer', { duration: 5000, panelClass: ['snack-error'] });
      },
    });
  }
}
