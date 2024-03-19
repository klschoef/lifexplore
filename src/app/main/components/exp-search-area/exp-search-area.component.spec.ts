import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpSearchAreaComponent } from './exp-search-area.component';

describe('ExpSearchAreaComponent', () => {
  let component: ExpSearchAreaComponent;
  let fixture: ComponentFixture<ExpSearchAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpSearchAreaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpSearchAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
