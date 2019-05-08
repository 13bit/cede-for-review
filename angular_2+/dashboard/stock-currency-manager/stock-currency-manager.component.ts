import {Component, OnInit} from '@angular/core';
import {DashboardService} from '@app/dashboard/dashboard.service';
import {STOCKS} from '@app/shared/stocks';
import {StockService} from '@app/core/stock.service';
import {Exchanger} from '@app/shared/model/exchanger';
import {CurrencyPairService} from '@app/core/currency-pair.service';
import {CurrencyPair} from '@app/shared/model/order/currency-pair';

@Component({
  selector: 'app-stock-currency-manager',
  templateUrl: './stock-currency-manager.component.html',
  styleUrls: ['./stock-currency-manager.component.css']
})
export class StockCurrencyManagerComponent implements OnInit {
  stocks: string[];
  selectedStock: string;
  currencyPairs: CurrencyPair[];
  selectedCurrencyPair: CurrencyPair;

  constructor(private dashboardService: DashboardService,
              private stockService: StockService,
              private currencyPairService: CurrencyPairService) {
  }

  ngOnInit() {
    this.stocks = STOCKS;
    this.getCurrencyPairs();

    this.dashboardService.currentExchanger$.subscribe(({stock, currencyPair}) => {
      this.selectedStock = stock;
      this.selectedCurrencyPair = currencyPair;
    });
  }

  getCurrencyPairs(): void {
    let {stock} = this.dashboardService.currentExchanger$.getValue();
    if (stock === 'demo_exchange') {
      stock = 'bittrex';
    }

    this.stockService.getCurrencyPairs(stock).subscribe((currencyPairs: CurrencyPair[]) => {
      this.currencyPairs = currencyPairs;
      this.selectedCurrencyPair = this.currencyPairs.find(({baseCurrency, quoteCurrency}) => {
        const defaultCurrencyPair = this.currencyPairService.getDefaultCurrencyPairByStock(this.selectedStock);

        return defaultCurrencyPair.baseCurrency === baseCurrency
          && defaultCurrencyPair.quoteCurrency === quoteCurrency;
      });
    });
  }

  onStockChange(event): void {
    const selectedStock = event.target.value;

    const exchanger = new Exchanger(
      selectedStock,
      this.currencyPairService.getDefaultCurrencyPairByStock(selectedStock)
    );

    this.dashboardService.onChangeExchanger(exchanger);

    this.getCurrencyPairs();
  }

  onCurrencyChange(): void {
    const exchanger = new Exchanger(this.selectedStock, this.selectedCurrencyPair);

    this.dashboardService.onChangeExchanger(exchanger);
  }

}
