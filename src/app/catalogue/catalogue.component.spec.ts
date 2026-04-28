import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CatalogueComponent } from './catalogue.component';
import { BookService } from '../core/services/book.service';
import { ReservationService } from './reservation.service';
import { MatDialog } from '@angular/material/dialog';

describe('CatalogueComponent', () => {
  let fixture: ComponentFixture<CatalogueComponent>;
  let bookService: jasmine.SpyObj<BookService>;
  let reservationService: jasmine.SpyObj<ReservationService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    bookService = jasmine.createSpyObj<BookService>('BookService', ['searchBooks']);
    reservationService = jasmine.createSpyObj<ReservationService>('ReservationService', ['getSuggestedReservationDates', 'buildPreview', 'createReservation']);
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    bookService.searchBooks.and.returnValue(of([]));
    reservationService.getSuggestedReservationDates.and.returnValue({ startDate: '2026-05-01', endDate: '2026-05-14' });
    reservationService.buildPreview.and.returnValue({ requestedStartDate: '2026-05-01', requestedEndDate: '2026-05-14', effectiveStartDate: '2026-05-01', effectiveEndDate: '2026-05-14', rank: 1, shifted: false, note: 'ok' });
    dialog.open.and.returnValue({ afterClosed: () => of(null) } as any);

    await TestBed.configureTestingModule({
      imports: [CatalogueComponent],
      providers: [
        provideRouter([]),
        { provide: BookService, useValue: bookService },
        { provide: ReservationService, useValue: reservationService },
        { provide: MatDialog, useValue: dialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogueComponent);
    fixture.detectChanges();
  });

  it('loads books on init', () => {
    expect(bookService.searchBooks).toHaveBeenCalled();
  });

  it('maps reservation status labels', () => {
    expect(fixture.componentInstance.statusLabel('available')).toBe('Disponible');
  });
});
