import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AddBookComponent } from './add-book.component';

describe('AddBookComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBookComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('keeps the form invalid until required fields are filled', () => {
    const fixture = TestBed.createComponent(AddBookComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.invalid).toBeTrue();
  });

  it('submits a valid book and resets the form', () => {
    const fixture = TestBed.createComponent(AddBookComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.setValue({
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '978',
      totalCopies: 4,
    });

    let emitted = false;
    fixture.componentInstance.bookAdded.subscribe(() => (emitted = true));

    fixture.componentInstance.submit();

    const req = httpMock.expectOne('books');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe('Dune');
    req.flush({ id: 1, title: 'Dune', author: 'Frank Herbert', isbn: '978', totalCopies: 4 });

    expect(emitted).toBeTrue();
    expect(fixture.componentInstance.form.controls.title.value).toBe('');
    expect(fixture.componentInstance.form.controls.totalCopies.value).toBe(1);
  });
});
