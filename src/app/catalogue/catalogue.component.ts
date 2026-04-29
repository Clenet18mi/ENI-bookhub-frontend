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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReservationsService } from '../reservations/reservations.service';
import { ReservationItem } from '../reservations/reservation.model';
import { BookService, BookDTO } from '../books/book.service';
import { SlicePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { LoansService } from '../loans/services/loans.service';
import { LoanDialog } from '../loans/components/loan-dialog/loan-dialog';
import { LoanDialogSuccess } from '../loans/components/loan-dialog-success/loan-dialog-success';
import { ProfileService } from '../profile/profile.service';
import { AddBookDialog } from '../books/components/add-book-dialog/add-book-dialog';
import { AddBookSuccessDialogComponent } from '../books/components/add-book-success-dialog/add-book-success-dialog';

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
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.scss',
  
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

    if (this.isUser()) {
      forkJoin({
        books: this.bookService.getBooks(),
        reservations: this.reservationsService.getMyReservations(),
        loanCount: this.loanService.getLoanCount()
      }).subscribe({
        next: ({ books, reservations, loanCount }) => {
          this.books.set(books);

          // Construire le set des bookId déjà réservés (statuts actifs uniquement)
          const activeStatuses = new Set(['PENDING', 'AVAILABLE']);
          const ids = new Set(
            reservations
              .filter((r: ReservationItem) => activeStatuses.has(r.status))
              .map((r: ReservationItem) => r.bookId)
          );
          this.reservedBookIds.set(ids);
          this.currentLoanCount = loanCount;
          this.isMaxloan = loanCount >= 3;
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      this.bookService.getBooks().subscribe({
        next: (books) => {
          this.books.set(books);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading books', err);
          this.loading.set(false);
        }
      })
    }

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

  addBook(): void {
    const dialogRef = this.dialog.open(AddBookDialog, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const bookPayload: Partial<BookDTO> = {
          ...result,
          isbn: String(result.isbn),
          totalCopies: result.totalCopies,
          availableCopies: result.totalCopies,
          averageRating: 0
        };

        this.bookService.createBook(bookPayload).subscribe({
          next: (newBook) => {
            this.books.update(currentBooks => [newBook, ...currentBooks]);

            this.dialog.open(AddBookSuccessDialogComponent, {
              width: '450px',
              data: { book: newBook }
            });
          },
          error: (err) => {
            this.snackBar.open("Erreur lors de la création du livre", "Fermer");
            console.error("Erreur détaillée:", err);
          }
        });
      }
    });
  }

  isAvailable(book: BookDTO): boolean {
    return book.availableCopies > 0;
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
