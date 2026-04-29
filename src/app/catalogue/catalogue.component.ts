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
import { AddBookDialog } from '../books/components/add-book-dialog/add-book-dialog';
import { AddBookSuccessDialogComponent } from '../books/components/add-book-success-dialog/add-book-success-dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BookDTO } from '../books/book.service';
import { LoanDialogSuccess } from '../loans/components/loan-dialog-success/loan-dialog-success';
import { LoanDialog } from '../loans/components/loan-dialog/loan-dialog';

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
    MatDialogModule
  ],
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.scss',
})
export class CatalogueComponent implements OnInit {

  private readonly bookService = inject(BookService);
  private readonly reservationsService = inject(ReservationsService);
  private readonly loansService = inject(LoansService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  // ── État ────────────────────────────────────────────────────────────────
  readonly books = signal<Book[]>([]);
  readonly loading = signal(true);
  readonly reserving = signal<number | null>(null);
  readonly loaning = signal<number | null>(null);

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
  query = '';
  category = 'all';
  availability = 'all';
  sortBy = 'featured';

  // ── Stats calculées ─────────────────────────────────────────────────────
  readonly totalBooks = () => this.books().length;
  readonly availableBooks = () => this.books().filter(b => (b.availableCopies ?? 0) > 0).length;
  readonly unavailableBooks = () => this.books().filter(b => (b.availableCopies ?? 0) === 0).length;
  readonly categories = () =>
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
    const role = this.authService.getRole();

    // CAS 1 : C'est un simple LECTEUR (ROLE_USER)
    if (this.isConnected && role === 'ROLE_USER') {
      forkJoin({
        books: this.bookService.getBooks(),
        reservations: this.reservationsService.getMyReservations(),
        loanCount: this.loansService.getLoanCount(),
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

      // CAS 2 : C'est un BIBLIOTHÉCAIRE ou un utilisateur NON CONNECTÉ
    } else {
      // On ne charge QUE les livres
      this.bookService.getBooks().subscribe({
        next: (list) => {
          this.books.set(list);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  // ── Filtres / tri ────────────────────────────────────────────────────────
  readonly filteredBooks = (): Book[] => {
    const q = this.query.trim().toLowerCase();
    let list = this.books().filter(book => {
      const matchQ = !q || [book.title, book.author, book.isbn ?? '']
        .some(v => v.toLowerCase().includes(q));
      const matchCat = this.category === 'all' || book.category === this.category;
      const copies = book.availableCopies ?? 0;
      const matchAvail =
        this.availability === 'all' ||
        (this.availability === 'available' && copies > 0) ||
        (this.availability === 'unavailable' && copies === 0);
      return matchQ && matchCat && matchAvail;
    });

    if (this.sortBy === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
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
    const dialogRef = this.dialog.open(AddBookDialog, {
      width: '550px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

        const bookPayload: BookDTO = {
          ...result,
          availableCopies: result.totalCopies,
          averageRating: 0
        };

        this.createBook(bookPayload);
      }
    });
  }

  private createBook(bookData: BookDTO): void {
    this.bookService.createBook(bookData).subscribe({
      next: (newBook) => {
        this.dialog.open(AddBookSuccessDialogComponent, {
          data: { book: newBook },
          width: '450px'
        });

        this.loadBooks();
      },
      error: (err) => {
        console.error("Erreur lors de la création du livre :", err);
      }
    });
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (data) => {
        // On met à jour la liste (si c'est un signal)
        this.books.set(data);
        // Ou : this.books = data; (si c'est une variable classique)
      },
      error: (err) => console.error('Erreur chargement catalogue', err)
    });
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

    // 1. Dates fictives pour l'affichage dans le premier dialogue
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);

    // 2. Premier dialogue : Confirmation
    const dialogRef = this.dialog.open(LoanDialog, {
      width: '450px',
      data: {
        book: book,
        preview: {
          startDate: today.toISOString(),
          endDate: dueDate.toISOString()
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Si l'utilisateur a validé (result n'est pas undefined)
      if (result) {
        this.loaning.set(book.id!);

        this.loansService.createLoan(book.id!).subscribe({
          next: () => {
            this.loaning.set(null);
            this.currentLoanCount++;
            this.loadAll();

            // 3. Deuxième dialogue : Succès
            // On passe directement l'objet 'book' ou un objet construit à la volée
            this.dialog.open(LoanDialogSuccess, {
              width: '400px',
              data: {
                title: book.title,
                dueDate: dueDate, // La date calculée plus haut
                author: book.author
              }
            });
          },
          error: (err) => {
            this.loaning.set(null);
            const msg = err?.error?.detail ?? 'Erreur lors de l\'emprunt.';
            this.snackBar.open(msg, 'Fermer', { duration: 5000 });
          }
        });
      }
    });
  }
}
