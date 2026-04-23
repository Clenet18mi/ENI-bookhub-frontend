import { Injectable } from '@angular/core';

export type DashboardStat = {
  label: string;
  value: string;
  hint: string;
  icon: string;
  tone: 'forest' | 'amber' | 'warn';
};

export type DashboardLoan = {
  title: string;
  author: string;
  due: string;
  status: string;
  statusTone: 'late' | 'normal';
};

export type DashboardReservation = {
  title: string;
  author: string;
  availability: string;
  chips: string[];
};

@Injectable({ providedIn: 'root' })
export class DashboardService {
  getStats(): DashboardStat[] {
    return [
      { label: 'Emprunts en cours', value: '3', hint: 'livres empruntés', icon: 'menu_book', tone: 'forest' },
      { label: 'Réservations', value: '1', hint: 'livre réservé', icon: 'bookmark', tone: 'amber' },
      { label: 'Alertes', value: '1', hint: 'retard en cours', icon: 'warning_amber', tone: 'warn' },
    ];
  }

  getRecentLoans(): DashboardLoan[] {
    return [
      { title: 'Le Chant des forêts', author: 'M. Durand', due: '20/04/2026', status: 'RETARD', statusTone: 'late' },
      { title: 'Les Horizons partagés', author: 'A. Bernard', due: '30/04/2026', status: 'En cours', statusTone: 'normal' },
      { title: 'Carnet de lecture', author: 'L. Martin', due: '30/04/2026', status: 'En cours', statusTone: 'normal' },
    ];
  }

  getReservations(): DashboardReservation[] {
    return [
      { title: 'La Ville invisible', author: 'S. Cohen', availability: 'Disponible sous 3 jours', chips: ['Position 1', 'Réservation active'] },
      { title: 'Atlas des histoires', author: 'J. Lefevre', availability: 'Disponible sous 6 jours', chips: ['Position 2', 'En attente'] },
    ];
  }
}
