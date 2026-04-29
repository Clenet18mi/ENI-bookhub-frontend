import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReservationsService } from './reservations.service';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ReservationsService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ReservationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('creates a reservation', () => {
    service.createReservation(7).subscribe();
    const req = httpMock.expectOne('reservations');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ bookId: 7 });
    req.flush({ id: 1, bookId: 7, bookTitle: 'Dune', bookAuthor: 'Frank', bookCategory: null, bookCoverUrl: null, rank: 1, status: 'PENDING', reservationDate: '2026-04-28' });
  });

  it('gets my reservations', () => {
    service.getMyReservations().subscribe();
    const req = httpMock.expectOne('reservations/my');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('cancels a reservation', () => {
    service.cancelReservation(3).subscribe();
    const req = httpMock.expectOne('reservations/3');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
