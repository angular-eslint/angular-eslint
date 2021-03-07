import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnotherLibComponent } from './another-lib.component';

describe('AnotherLibComponent', () => {
  let component: AnotherLibComponent;
  let fixture: ComponentFixture<AnotherLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnotherLibComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnotherLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
