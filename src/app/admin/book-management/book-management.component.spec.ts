import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BookManagementComponent } from './book-management.component';
import { BookService } from '../../core/services/book.service';

describe('BookManagementComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    spyOn(window, 'confirm').and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [BookManagementComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads books on init', () => {
    const fixture = TestBed.createComponent(BookManagementComponent);
    fixture.detectChanges();

    const req = httpMock.expectOne('books');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, title: 'Dune', author: 'Frank Herbert', isbn: '1', totalCopies: 3 }]);

    expect(fixture.componentInstance.books.length).toBe(1);
  });

  it('deletes a book when confirmed', () => {
    const fixture = TestBed.createComponent(BookManagementComponent);
    fixture.detectChanges();

    httpMock.expectOne('books').flush([]);

    fixture.componentInstance.deleteBook(5);

    const deleteReq = httpMock.expectOne('books/5');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({});

    httpMock.expectOne('books').flush([]);
  });
});
