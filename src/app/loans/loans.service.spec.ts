import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoansService } from './services/loans.service';

describe('LoansService', () => {
  let service: LoansService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [LoansService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(LoansService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('gets my loans', () => {
    service.getMyLoans().subscribe();
    const req = httpMock.expectOne('loans/my');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('returns a loan', () => {
    service.returnLoan(9).subscribe();
    const req = httpMock.expectOne('loans/9/return');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('creates a loan', () => {
    service.createLoan(5).subscribe();
    const req = httpMock.expectOne('loans/create');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ bookId: 5 });
    req.flush({
      id: 1,
      userEmail: 'user@example.com',
      userFullName: 'User Example',
      bookId: 5,
      bookTitle: 'Dune',
      bookIsbn: '123',
      bookAuthor: 'Frank Herbert',
      bookCategory: 'SF',
      loanDate: '2026-04-28',
      dueDate: '2026-05-12',
      returnDate: null,
      status: 'ACTIVE',
    });
  });

  it('gets loan count', () => {
    service.getLoanCount().subscribe();
    const req = httpMock.expectOne('loans/count');
    expect(req.request.method).toBe('GET');
    req.flush(4);
  });
});
