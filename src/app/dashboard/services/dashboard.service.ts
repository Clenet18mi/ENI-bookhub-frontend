import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoanResponse } from '../../loans/models/loan-response.model';

/**
 * Réservation du lecteur connecté — shape retournée par GET /api/reservations/my.
 * Miroir du ReservationResponse.java du backend.
 */
export interface UserReservation {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCategory: string;
  bookCoverUrl: string | null;
  rank: number;
  /** WAITING | AVAILABLE | BORROWED | CANCELED */
  status: 'WAITING' | 'AVAILABLE' | 'BORROWED' | 'CANCELED';
  reservationDate: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  /**
   * GET /api/loans/my
   * Tous les emprunts (actifs, retardés, retournés) du lecteur connecté.
   */
  getMyLoans(): Observable<LoanResponse[]> {
    return this.http.get<LoanResponse[]>('loans/my');
  }

  /**
   * GET /api/reservations/my
   * Toutes les réservations du lecteur connecté.
   */
  getMyReservations(): Observable<UserReservation[]> {
    return this.http.get<UserReservation[]>('reservations/my');
  }
}
