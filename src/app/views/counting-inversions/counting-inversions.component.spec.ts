import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountingInversionsComponent } from './counting-inversions.component';

describe('CountingInversionsComponent', () => {
  let component: CountingInversionsComponent;
  let fixture: ComponentFixture<CountingInversionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountingInversionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountingInversionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
