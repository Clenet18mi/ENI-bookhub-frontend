import { Injectable } from '@angular/core';

export type ReservationBookStatus = 'available' | 'loaned' | 'reserved';

export interface ReservationBookSummary {
  title: string;
  author: string;
  category: string;
  status: ReservationBookStatus;
  nextAvailable?: string;
  queue?: string;
}

export interface ReservationPreview {
  requestedStartDate: string;
  requestedEndDate: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
  rank: number;
  shifted: boolean;
  note: string;
}

export interface ReservationRequest {
  bookTitle: string;
  bookAuthor: string;
  category: string;
  requestedStartDate: string;
  requestedEndDate: string;
}

export interface ReservationRecord extends ReservationRequest {
  reservationId: string;
  createdAt: string;
  rank: number;
  effectiveStartDate: string;
  effectiveEndDate: string;
  shifted: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly storageKey = 'bookhub_reservations';

  getSuggestedReservationDates(book: ReservationBookSummary): { startDate: string; endDate: string } {
    const nextFree = book.nextAvailable ?? this.addDays(this.todayIso(), 1);
    const suggestedStart = this.compareIsoDate(nextFree, this.addDays(this.todayIso(), 1)) > 0 ? nextFree : this.addDays(this.todayIso(), 1);
    return {
      startDate: suggestedStart,
      endDate: this.addDays(suggestedStart, 13),
    };
  }

  buildPreview(book: ReservationBookSummary, requestedStartDate: string, requestedEndDate: string): ReservationPreview {
    const requested = this.normalizeRange(requestedStartDate, requestedEndDate, book);
    const blocks = this.getBusyBlocks(book);
    const effective = this.findAvailableRange(requested.startDate, requested.endDate, blocks);
    const shifted = requested.startDate !== effective.startDate || requested.endDate !== effective.endDate;

    return {
      requestedStartDate: requested.startDate,
      requestedEndDate: requested.endDate,
      effectiveStartDate: effective.startDate,
      effectiveEndDate: effective.endDate,
      rank: this.getMyReservations().filter((reservation) => reservation.bookTitle === book.title).length + 1,
      shifted,
      note: shifted
        ? `Le livre est occupé sur la période demandée. La réservation sera placée du ${this.formatIsoDate(effective.startDate)} au ${this.formatIsoDate(effective.endDate)}.`
        : `La période demandée est disponible du ${this.formatIsoDate(effective.startDate)} au ${this.formatIsoDate(effective.endDate)}.`,
    };
  }

  createReservation(request: ReservationRequest): ReservationRecord {
    const existing = this.getMyReservations();
    const duplicate = existing.find(
      (reservation) =>
        reservation.bookTitle === request.bookTitle &&
        reservation.requestedStartDate === request.requestedStartDate &&
        reservation.requestedEndDate === request.requestedEndDate,
    );

    if (duplicate) {
      return duplicate;
    }

    const effective = this.findAvailableRange(
      request.requestedStartDate,
      request.requestedEndDate,
      this.getBusyBlocks({
        title: request.bookTitle,
        author: request.bookAuthor,
        category: request.category,
        status: 'loaned',
      }),
    );

    const record: ReservationRecord = {
      ...request,
      reservationId: `RES-${Date.now()}`,
      createdAt: new Date().toISOString(),
      rank: existing.filter((reservation) => reservation.bookTitle === request.bookTitle).length + 1,
      effectiveStartDate: effective.startDate,
      effectiveEndDate: effective.endDate,
      shifted: effective.startDate !== request.requestedStartDate || effective.endDate !== request.requestedEndDate,
    };

    this.saveReservations([record, ...existing]);
    return record;
  }

  getMyReservations(): ReservationRecord[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as ReservationRecord[];
    } catch {
      return [];
    }
  }

  hasReservation(bookTitle: string): boolean {
    return this.getMyReservations().some((reservation) => reservation.bookTitle === bookTitle);
  }

  cancelReservation(reservationId: string): void {
    this.saveReservations(this.getMyReservations().filter((reservation) => reservation.reservationId !== reservationId));
  }

  private getBusyBlocks(book: ReservationBookSummary): Array<{ startDate: string; endDate: string }> {
    const blocks = this.getMyReservations()
      .filter((reservation) => reservation.bookTitle === book.title)
      .map((reservation) => ({ startDate: reservation.effectiveStartDate, endDate: reservation.effectiveEndDate }));

    if (book.status !== 'available' && book.nextAvailable) {
      blocks.push({ startDate: this.todayIso(), endDate: book.nextAvailable });
    }

    return blocks.sort((a, b) => this.compareIsoDate(a.startDate, b.startDate));
  }

  private findAvailableRange(startDate: string, endDate: string, blocks: Array<{ startDate: string; endDate: string }>): { startDate: string; endDate: string } {
    const duration = this.daysBetween(startDate, endDate);
    let candidateStart = startDate;
    let candidateEnd = endDate;

    for (let guard = 0; guard < 20; guard += 1) {
      const conflict = blocks.find((block) => this.rangesOverlap(candidateStart, candidateEnd, block.startDate, block.endDate));
      if (!conflict) {
        break;
      }

      candidateStart = this.addDays(conflict.endDate, 1);
      candidateEnd = this.addDays(candidateStart, duration);
    }

    return { startDate: candidateStart, endDate: candidateEnd };
  }

  private normalizeRange(requestedStartDate: string, requestedEndDate: string, book: ReservationBookSummary): { startDate: string; endDate: string } {
    const suggested = this.getSuggestedReservationDates(book);
    const startDate = requestedStartDate || suggested.startDate;
    const endDate = requestedEndDate || this.addDays(startDate, 13);

    return this.compareIsoDate(startDate, endDate) <= 0
      ? { startDate, endDate }
      : { startDate, endDate: this.addDays(startDate, 13) };
  }

  private saveReservations(reservations: ReservationRecord[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(reservations));
  }

  private todayIso(): string {
    return this.toIsoDate(new Date());
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private addDays(isoDate: string, days: number): string {
    const date = this.fromIsoDate(isoDate);
    date.setDate(date.getDate() + days);
    return this.toIsoDate(date);
  }

  private daysBetween(startDate: string, endDate: string): number {
    const start = this.fromIsoDate(startDate).getTime();
    const end = this.fromIsoDate(endDate).getTime();
    return Math.max(0, Math.round((end - start) / (24 * 60 * 60 * 1000)));
  }

  private rangesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
    return this.compareIsoDate(startA, endB) <= 0 && this.compareIsoDate(endA, startB) >= 0;
  }

  private fromIsoDate(isoDate: string): Date {
    return new Date(`${isoDate}T00:00:00`);
  }

  private compareIsoDate(a: string, b: string): number {
    return this.fromIsoDate(a).getTime() - this.fromIsoDate(b).getTime();
  }

  private formatIsoDate(isoDate: string): string {
    return this.fromIsoDate(isoDate).toLocaleDateString('fr-FR');
  }
}
