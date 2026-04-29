import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBookDialog } from './update-book-dialog';

describe('UpdateBookDialog', () => {
  let component: UpdateBookDialog;
  let fixture: ComponentFixture<UpdateBookDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateBookDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateBookDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
