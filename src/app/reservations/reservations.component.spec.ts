import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReservationsComponent } from './reservations.component';
import { ReservationsService } from './reservations.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('ReservationsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationsComponent],
      providers: [
        { provide: ReservationsService, useValue: { getMyReservations: () => of([]), cancelReservation: () => of(void 0) } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
      ],
    }).compileComponents();
  });

  it('computes status helpers', () => {
    const fixture = TestBed.createComponent(ReservationsComponent);
    expect(fixture.componentInstance.canCancel('PENDING')).toBeTrue();
    expect(fixture.componentInstance.statusLabel('CANCELLED')).toBe('Annulée');
  });
});
