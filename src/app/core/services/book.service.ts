import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, BookDetail } from '../models/book.model';

// Paramètres possibles pour rechercher/filtrer/trier les livres
export interface BookSearchParams {
  query?: string;
  category?: string;
  available?: boolean;
  sort?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private http = inject(HttpClient);
  // Récupère tous les livres du catalogue
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>('books');
  }

  // Appelle l'endpoint GET /api/books/search avec les filtres sélectionnés
  searchBooks(filters: BookSearchParams): Observable<Book[]> {
    let params = new HttpParams();

    // Recherche sur titre, auteur ou ISBN
    if (filters.query) {
      params = params.set('query', filters.query);
    }

    // Filtre par catégorie
    if (filters.category) {
      params = params.set('category', filters.category);
    }

    // Filtre par disponibilité
    if (filters.available !== undefined) {
      params = params.set('available', filters.available);
    }

    // Tri des résultats : note, date, titre...
    if (filters.sort) {
      params = params.set('sort', filters.sort);
    }

    return this.http.get<Book[]>('books/search', { params });
  }


  getBookById(id: number): Observable<BookDetail> {
    return this.http.get<BookDetail>(`books/${id}`);
  }


  addBook(book: Book): Observable<Book> {
    return this.http.post<Book>('books', book);
  }


  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`books/${id}`);
  }
}
