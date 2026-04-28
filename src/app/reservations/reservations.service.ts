import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReservationItem, ReservationRequest } from './reservation.model';

/**
 * Service Angular pour la gestion des réservations.
 *
 * Endpoints consommés :
 *   POST   /api/reservations         → créer une réservation (US-RESA-01)
 *   GET    /api/reservations/my      → mes réservations     (US-RESA-02)
 *   DELETE /api/reservations/{id}    → annuler              (US-RESA-02)
 *
 * Le JWT est automatiquement ajouté par l'ApiInterceptor.
 */
@Injectable({ providedIn: 'root' })
export class ReservationsService {
  private readonly http = inject(HttpClient);

  /**
   * Crée une réservation pour le livre identifié.
   * Le livre doit être indisponible (availableCopies === 0).
   *
   * @returns Observable<ReservationItem> avec le rang calculé
   */
  createReservation(bookId: number): Observable<ReservationItem> {
    const body: ReservationRequest = { bookId };
    return this.http.post<ReservationItem>('reservations', body);
  }

  /**
   * Récupère toutes les réservations de l'utilisateur connecté.
   * Triées par date de réservation décroissante.
   */
  getMyReservations(): Observable<ReservationItem[]> {
    return this.http.get<ReservationItem[]>('reservations/my');
  }

  /**
   * Annule une réservation appartenant à l'utilisateur connecté.
   * Réordonnancement des rangs effectué côté backend.
   */
  cancelReservation(reservationId: number): Observable<void> {
    return this.http.delete<void>(`reservations/${reservationId}`);
  }
}
