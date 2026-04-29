import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan } from '../models/loan.model';
import { LoanResponse } from '../models/loan-response.model';

/** Correspond au LoanResponse.java du backend. */


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

  getAllLoans(): Observable<LoanResponse[]> {
    return this.http.get<LoanResponse[]>("loans/all");
  }

  returnLoan(loanId: number): Observable<void> {
    return this.http.put<void>(`loans/${loanId}/return`, {});
  }

  /**
   * PUT /api/loans/{id}/approve
   * Valide un emprunt en statut PENDING → ACTIVE (réservé au LIBRARIAN).
   */
  approveLoan(loanId: number): Observable<void> {
    return this.http.put<void>(`loans/${loanId}/approve`, {});
  }

  createLoan(bookId: number): Observable<LoanResponse> {
    return this.http.post<LoanResponse>(`loans/create`, { bookId })
  }

  getLoanCount(): Observable<number> {
    return this.http.get<number>(`loans/count`);
  }
}
