import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BookService } from '../../core/services/book.service';
import { BookDetail } from '../../core/models/book.model';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.scss']
})
export class BookDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);

  book?: BookDetail;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.bookService.getBookById(id).subscribe({
        next: (data) => this.book = data,
        error: (err) => console.error("Erreur de chargement", err)
      });
    }
  }

  onDelete() {
    if (this.book?.id && confirm('Supprimer ce livre ?')) {
      this.bookService.deleteBook(this.book.id).subscribe(() => {
        this.router.navigate(['/catalogue']);
      });
    }
  }
}
