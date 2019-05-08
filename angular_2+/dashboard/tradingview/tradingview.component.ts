import {AfterViewInit, Component, OnInit} from '@angular/core';
import {DashboardService} from '@app/dashboard/dashboard.service';
import {CurrencyPair} from '@app/shared/model/order/currency-pair';

declare const TradingView: any;

@Component({
  selector: 'app-trading-view',
  templateUrl: './tradingview.component.html',
  styleUrls: ['./tradingview.component.css']
})
export class TradingViewComponent implements OnInit, AfterViewInit {

  private readonly tradingViewLibUrl = 'https://s3.tradingview.com/tv.js';
  private widget: any;
  isChartLoaded: boolean;

  currentSymbol: string;

  constructor(private dashboardService: DashboardService) {
  }

  ngOnInit() {
    this.isChartLoaded = true;
  }

  ngAfterViewInit(): void {
    this.loadScript(this.tradingViewLibUrl)
      .then(value => {
        this.dashboardService.currentExchanger$.subscribe(({stock, currencyPair}) => {
          this.selectSymbol(this.getSymbolName(stock, currencyPair));
        });
      })
      .catch((err) => {
        console.error('TradingView library not reachable');
        this.isChartLoaded = false;
      });
  }

  selectSymbol(symbol: string): void {
    this.currentSymbol = symbol;
    this.drawChart();
  }

  getSymbolName(stock: string, currencyPair: CurrencyPair): string {
    if (stock === 'demo_exchange') {
      stock = 'bittrex';
    }
    return `${stock.toUpperCase()}:${currencyPair.baseCurrency}${currencyPair.quoteCurrency}`;
  }

  drawChart(): void {
    this.widget = new TradingView.widget(
      {
        'width': '100%',
        'height': '100%',
        'symbol': this.currentSymbol,
        'interval': 'D',
        'timezone': 'Etc/UTC',
        'theme': 'Dark',
        'style': '1',
        'locale': 'en',
        'toolbar_bg': '#f1f3f6',
        'enable_publishing': false,
        'hide_side_toolbar': false,
        'container_id': 'tradingview'
      }
    );
  }

  /**
   * [NOTE] Angular remove from templates tag <script>.
   * We create tag dynamically.
   */
  private loadScript(scriptUrl: string) {
    return new Promise((resolve, reject) => {
      const scriptElement = document.createElement('script');
      scriptElement.src = scriptUrl;
      scriptElement.addEventListener('load', () => resolve());
      scriptElement.addEventListener('error', (error) => reject(error));

      document.body.appendChild(scriptElement);
    });
  }
}
