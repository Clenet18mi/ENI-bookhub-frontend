import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReservationBookSummary, ReservationPreview } from './reservation.service';

export interface ReservationDialogData {
  book: ReservationBookSummary;
  preview: ReservationPreview;
}

@Component({
  selector: 'app-reservation-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Réserver ce livre</h2>
    <mat-dialog-content class="dialog-content">
      <section class="summary-card">
        <div>
          <p class="eyebrow">{{ data.book.category }}</p>
          <h3>{{ data.book.title }}</h3>
          <p>{{ data.book.author }}</p>
        </div>
        <span class="status" [class]="data.book.status">{{ statusLabel }}</span>
      </section>

      <section class="info-grid">
        <div>
          <strong>Rang estimé</strong>
          <p>#{{ data.preview.rank }}</p>
        </div>
        <div>
          <strong>Créneau demandé</strong>
          <p>{{ data.preview.requestedStartDate }} → {{ data.preview.requestedEndDate }}</p>
        </div>
        <div class="wide">
          <strong>Créneau effectif</strong>
          <p>{{ data.preview.effectiveStartDate }} → {{ data.preview.effectiveEndDate }}</p>
        </div>
        <div class="wide">
          <strong>État</strong>
          <p>{{ data.preview.note }}</p>
        </div>
      </section>

      <form [formGroup]="form" class="dialog-form">
        <p class="hint">La réservation est préparée pour le backend avec créneau, file d’attente et validation.</p>

        <div class="date-grid">
          <mat-form-field appearance="outline">
            <mat-label>Date de début</mat-label>
            <input matInput type="date" formControlName="startDate" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date de fin</mat-label>
            <input matInput type="date" formControlName="endDate" />
          </mat-form-field>
        </div>

        <mat-checkbox formControlName="acceptRules">
          J'accepte les conditions de réservation et d'attente.
        </mat-checkbox>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="form.getRawValue()" [disabled]="form.invalid">
        Confirmer la réservation
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-content { display: grid; gap: 1rem; min-width: min(92vw, 560px); }
      .summary-card { display: flex; justify-content: space-between; gap: 1rem; align-items: start; padding: 1rem; border-radius: 16px; background: var(--bh-paper); border: 1px solid rgba(26,26,26,.08); }
      .eyebrow { margin: 0 0 .25rem; text-transform: uppercase; letter-spacing: .12em; font-size: .75rem; color: var(--bh-forest-mid); }
      h3 { margin: 0; font-family: 'DM Serif Display', Georgia, serif; font-size: 1.35rem; }
      .status { padding: .4rem .75rem; border-radius: 999px; font-weight: 700; font-size: .82rem; }
      .available { background: var(--bh-forest-pale); color: var(--bh-forest); }
      .loaned { background: #fff3da; color: #8a5a00; }
      .reserved { background: #f2ebff; color: #5d3bb0; }
      .info-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
      .info-grid > div { padding: .85rem 1rem; border-radius: 14px; background: #fff; border: 1px solid rgba(26,26,26,.08); }
      .wide { grid-column: 1 / -1; }
      .dialog-form { display: grid; gap: .9rem; }
      .date-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
      .hint { margin: 0; color: var(--bh-ink-mid); font-size: .92rem; }
      p { margin: .25rem 0 0; color: var(--bh-ink-mid); }
      @media (max-width: 640px) { .info-grid, .date-grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class ReservationDialogComponent {
  readonly form = new FormBuilder().nonNullable.group({
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    acceptRules: [false, [Validators.requiredTrue]],
  });

  constructor(@Inject(MAT_DIALOG_DATA) readonly data: ReservationDialogData) {
    this.form.setValue({
      startDate: data.preview.requestedStartDate,
      endDate: data.preview.requestedEndDate,
      acceptRules: false,
    });
  }

  get statusLabel(): string {
    switch (this.data.book.status) {
      case 'available': return 'Disponible';
      case 'loaned': return 'Emprunté';
      case 'reserved': return 'Réservé';
    }
  }
}
