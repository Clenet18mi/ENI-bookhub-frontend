import { Component, inject, OnInit, signal } from '@angular/core';
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
import { ReservationsService } from '../reservations/reservations.service';
import { BookService, BookDTO } from '../books/book.service';
import { SlicePipe } from '@angular/common';

/**
 * Page catalogue — version connectée au backend.
 *
 * Intègre le bouton « Réserver » (US-RESA-01) :
 *  - visible uniquement si availableCopies === 0
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
    SlicePipe,
  ],
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.scss',
})
export class CatalogueComponent implements OnInit {

  private readonly reservationsService = inject(ReservationsService);
  private readonly bookService         = inject(BookService);
  private readonly snackBar            = inject(MatSnackBar);

  readonly books      = signal<BookDTO[]>([]);
  readonly loading    = signal(true);
  readonly reserving  = signal<number | null>(null);

  query        = '';
  category     = 'all';
  availability = 'all';
  sortBy       = 'featured';

  // ── Stats calculées ────────────────────────────────────────────────────────
  readonly totalBooks      = () => this.books().length;
  readonly availableBooks  = () => this.books().filter(b => b.availableCopies > 0).length;
  readonly unavailableBooks = () => this.books().filter(b => b.availableCopies === 0).length;
  readonly categories      = () => [...new Set(this.books().map(b => b.category).filter(Boolean))] as string[];

  ngOnInit(): void {
    this.bookService.getBooks().subscribe({
      next: (list) => { this.books.set(list); this.loading.set(false); },
      error: ()   => this.loading.set(false),
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
          || (this.availability === 'available'   && book.availableCopies > 0)
          || (this.availability === 'unavailable' && book.availableCopies === 0);
        return matchQ && matchCat && matchAvail;
      });

      if (this.sortBy === 'title')  list = [...list].sort((a, b) => a.title.localeCompare(b.title));
      if (this.sortBy === 'rating') list = [...list].sort((a, b) => b.averageRating - a.averageRating);
      return list;
    };
  }

  isAvailable(book: BookDTO): boolean {
    return book.availableCopies > 0;
  }

  /** US-RESA-01 : réserver un livre indisponible */
  reserve(book: BookDTO): void {
    this.reserving.set(book.id);
    this.reservationsService.createReservation(book.id).subscribe({
      next: (res) => {
        this.reserving.set(null);
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
