import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteinerComponent } from './steiner.component';

describe('SteinerComponent', () => {
  let component: SteinerComponent;
  let fixture: ComponentFixture<SteinerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteinerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteinerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
