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
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './book-management.component.html'
})
export class BookManagementComponent implements OnInit {
  private bookService = inject(BookService);
  books: Book[] = [];
  displayedColumns = ['title', 'author', 'totalCopies', 'actions'];

  ngOnInit() { this.loadBooks(); }

  loadBooks() { this.bookService.getBooks().subscribe(res => this.books = res); }

  deleteBook(id: number) {
    if(confirm('Supprimer ce livre ?')) {
      this.bookService.deleteBook(id).subscribe(() => this.loadBooks());
    }
  }
}
