import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HuffmancodeComponent } from './huffmancode.component';

describe('HuffmancodeComponent', () => {
  let component: HuffmancodeComponent;
  let fixture: ComponentFixture<HuffmancodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HuffmancodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HuffmancodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
