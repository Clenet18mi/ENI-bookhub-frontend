/**
 * Modèles TypeScript pour le module Réservations.
 * Correspondent aux DTOs Java ReservationRequest / ReservationResponse.
 */

/** Statuts possibles d'une réservation (miroir de l'enum Java ReservationStatus). */
export type ReservationStatus = 'PENDING' | 'AVAILABLE' | 'BORROWED' | 'CANCELLED';

/**
 * Corps envoyé au backend pour créer une réservation.
 * POST /api/reservations
 */
export interface ReservationRequest {
  bookId: number;
}

/**
 * Réponse du backend pour une réservation.
 * Correspond à ReservationResponse.java
 */
export interface ReservationItem {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCategory: string | null;
  bookCoverUrl: string | null;
  rank: number;
  status: ReservationStatus;
  reservationDate: string; // ISO date (yyyy-MM-dd)
}
