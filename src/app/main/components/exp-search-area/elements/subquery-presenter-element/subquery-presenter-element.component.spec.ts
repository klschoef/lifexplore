import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubqueryPresenterElementComponent } from './subquery-presenter-element.component';

describe('SubqueryPresenterElementComponent', () => {
  let component: SubqueryPresenterElementComponent;
  let fixture: ComponentFixture<SubqueryPresenterElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubqueryPresenterElementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubqueryPresenterElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
