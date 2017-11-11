import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Wa8013Component } from './wa8013.component';

describe('Wa8013Component', () => {
  let component: Wa8013Component;
  let fixture: ComponentFixture<Wa8013Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Wa8013Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Wa8013Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
