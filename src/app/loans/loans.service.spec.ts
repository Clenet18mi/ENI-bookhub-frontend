import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoansService } from './loans.service';

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
});
