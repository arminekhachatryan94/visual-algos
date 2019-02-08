import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KruskalComponent } from './kruskal.component';

describe('KruskalComponent', () => {
  let component: KruskalComponent;
  let fixture: ComponentFixture<KruskalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KruskalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KruskalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
