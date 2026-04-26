import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Correspond au LoanResponse.java du backend. */
export interface Loan {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCategory: string | null;
  bookCoverUrl: string | null;
  loanDate: string;   // ISO date  (yyyy-MM-dd)
  dueDate: string;    // ISO date
  returnDate: string | null;
  status: 'ACTIVE' | 'OVERDUE' | 'RETURNED' | 'PENDING';
}

@Injectable({ providedIn: 'root' })
export class LoansService {
  private readonly http = inject(HttpClient);

  /**
   * GET /api/loans/my
   * Retourne tous les emprunts de l'utilisateur connecté.
   */
  getMyLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>('loans/my');
  }
}
