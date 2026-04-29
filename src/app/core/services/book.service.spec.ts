import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BookService } from './book.service';

describe('BookService', () => {
  let service: BookService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [BookService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(BookService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets books', () => {
    service.getBooks().subscribe();
    const req = httpMock.expectOne('books');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('searches books with query params', () => {
    service.searchBooks({ query: 'dune', category: 'SF', available: true, sort: 'rating_desc' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === 'books/search');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('query')).toBe('dune');
    expect(req.request.params.get('category')).toBe('SF');
    expect(req.request.params.get('available')).toBe('true');
    expect(req.request.params.get('sort')).toBe('rating_desc');
    req.flush([]);
  });

  it('adds a book', () => {
    service.addBook({ title: 'Dune', author: 'Frank Herbert', totalCopies: 3 }).subscribe();
    const req = httpMock.expectOne('books');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe('Dune');
    req.flush({ id: 1, title: 'Dune', author: 'Frank Herbert', totalCopies: 3 });
  });

  it('deletes a book', () => {
    service.deleteBook(9).subscribe();
    const req = httpMock.expectOne('books/9');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
