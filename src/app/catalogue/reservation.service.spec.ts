import { TestBed } from '@angular/core/testing';
import { ReservationService } from './reservation.service';

describe('ReservationService', () => {
  let service: ReservationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [ReservationService] });
    service = TestBed.inject(ReservationService);
  });

  afterEach(() => localStorage.clear());

  it('suggests future dates for a loaned book', () => {
    spyOn(Date.prototype, 'toISOString').and.returnValue('2026-04-28T12:00:00.000Z');

    const dates = service.getSuggestedReservationDates({
      title: 'Dune', author: 'Frank', category: 'SF', status: 'loaned', nextAvailable: '2026-05-10',
    });

    expect(dates.startDate).toBe('2026-05-10');
  });

  it('builds a preview and shifts overlapping ranges', () => {
    service.createReservation({
      bookTitle: 'Dune',
      bookAuthor: 'Frank',
      category: 'SF',
      requestedStartDate: '2026-05-01',
      requestedEndDate: '2026-05-10',
    });

    const preview = service.buildPreview(
      { title: 'Dune', author: 'Frank', category: 'SF', status: 'loaned', nextAvailable: '2026-05-05' },
      '2026-05-01',
      '2026-05-10'
    );

    expect(preview.rank).toBe(2);
    expect(preview.shifted).toBeTrue();
  });

  it('creates and reads reservations from storage', () => {
    const record = service.createReservation({
      bookTitle: 'Dune', bookAuthor: 'Frank', category: 'SF', requestedStartDate: '2026-05-01', requestedEndDate: '2026-05-10',
    });

    expect(record.bookTitle).toBe('Dune');
    expect(service.hasReservation('Dune')).toBeTrue();
    expect(service.getMyReservations().length).toBe(1);
  });

  it('avoids duplicate reservations', () => {
    const first = service.createReservation({
      bookTitle: 'Dune', bookAuthor: 'Frank', category: 'SF', requestedStartDate: '2026-05-01', requestedEndDate: '2026-05-10',
    });
    const second = service.createReservation({
      bookTitle: 'Dune', bookAuthor: 'Frank', category: 'SF', requestedStartDate: '2026-05-01', requestedEndDate: '2026-05-10',
    });

    expect(second.reservationId).toBe(first.reservationId);
    expect(service.getMyReservations().length).toBe(1);
  });

  it('cancels reservations from storage', () => {
    const record = service.createReservation({
      bookTitle: 'Dune', bookAuthor: 'Frank', category: 'SF', requestedStartDate: '2026-05-01', requestedEndDate: '2026-05-10',
    });

    service.cancelReservation(record.reservationId);

    expect(service.getMyReservations()).toEqual([]);
  });
});
