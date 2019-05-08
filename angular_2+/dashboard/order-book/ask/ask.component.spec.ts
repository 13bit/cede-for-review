import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsksComponent } from './ask.component';

describe('AsksComponent', () => {
  let component: AsksComponent;
  let fixture: ComponentFixture<AsksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
