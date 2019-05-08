import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockCurrencyManagerComponent } from './stock-currency-manager.component';

describe('StockCurrencyManagerComponent', () => {
  let component: StockCurrencyManagerComponent;
  let fixture: ComponentFixture<StockCurrencyManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockCurrencyManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockCurrencyManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
