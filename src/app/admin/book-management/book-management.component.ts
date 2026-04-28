import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookService } from '../../core/services/book.service';
import { Book } from '../../core/models/book.model';

@Component({
  selector: 'app-book-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './book-management.component.html',
  styleUrl: './book-management.component.scss'
})
export class BookManagementComponent implements OnInit {
  private bookService = inject(BookService);

  books: Book[] = [];
  displayedColumns: string[] = ['title', 'author', 'totalCopies', 'actions'];

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (res) => this.books = res,
      error: (err) => console.error('Erreur chargement livres', err)
    });
  }

  deleteBook(id: number): void {
    if (confirm('Supprimer ce livre définitivement ?')) {
      this.bookService.deleteBook(id).subscribe({
        next: () => this.loadBooks(),
        error: (err) => console.error('Erreur suppression', err)
      });
    }
  }
}
