import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { BookService } from '../../core/services/book.service';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.scss'
})
export class AddBookComponent {
  @Output() bookAdded = new EventEmitter<void>();
  private fb = inject(FormBuilder);
  private bookService = inject(BookService);

  form = this.fb.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    isbn: [''],
    totalCopies: [1, [Validators.required, Validators.min(1)]]
  });

  submit() {
    if (this.form.valid) {
      this.bookService.addBook(this.form.getRawValue() as any).subscribe({
        next: () => {
          this.form.reset({ title: '', author: '', isbn: '', totalCopies: 1 });
          this.bookAdded.emit();
        }
      });
    }
  }
}
