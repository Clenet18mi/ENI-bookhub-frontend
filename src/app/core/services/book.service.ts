import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private http = inject(HttpClient);


  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>('books');
  }

  addBook(book: Book): Observable<Book> {
    return this.http.post<Book>('books', book);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`books/${id}`);
  }
}
