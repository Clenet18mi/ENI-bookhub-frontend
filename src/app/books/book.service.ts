import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Correspond au BookDTO.java du backend */
export interface BookDTO {
  id: number;
  title: string;
  author: string;
  isbn: string;
  description: string | null;
  category: string | null;
  coverUrl: string | null;
  averageRating: number;
  totalCopies: number;
  availableCopies: number;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly http = inject(HttpClient);

  /** GET /api/books */
  getBooks(search?: string, category?: string): Observable<BookDTO[]> {
    let params = new HttpParams();
    if (search)   params = params.set('search', search);
    if (category) params = params.set('category', category);
    return this.http.get<BookDTO[]>('books', { params });
  }

  /** GET /api/books/{id} */
  getBook(id: number): Observable<BookDTO> {
    return this.http.get<BookDTO>(`books/${id}`);
  }
}
