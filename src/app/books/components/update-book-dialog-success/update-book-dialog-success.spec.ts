import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBookDialogSuccess } from './update-book-dialog-success';

describe('UpdateBookDialogSuccess', () => {
  let component: UpdateBookDialogSuccess;
  let fixture: ComponentFixture<UpdateBookDialogSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateBookDialogSuccess],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateBookDialogSuccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
