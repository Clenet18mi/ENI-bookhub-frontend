import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BookService } from './book.service';

describe('Core BookService', () => {
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

  it('adds a book', () => {
    service.addBook({} as never).subscribe();
    const req = httpMock.expectOne('books');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
