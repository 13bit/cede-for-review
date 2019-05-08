import {Component, OnDestroy, OnInit} from '@angular/core';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {DashboardService} from '@app/dashboard/dashboard.service';
import {Exchanger} from '@app/shared/model/exchanger';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-order-book',
  templateUrl: './order-book.component.html',
  styleUrls: ['./order-book.component.css']
})
export class OrderBookComponent implements OnInit, OnDestroy {
  public config: PerfectScrollbarConfigInterface = {};

  exchanger: Exchanger;
  bidTotalVolume: { total: number, currency: string };
  askTotalVolume: { total: number, currency: string };
  lastPrice: number;
  lastTradesFailed: boolean;
  private lastTradesFailedSubscription$: Subscription;

  constructor(private dashboardService: DashboardService) {
  }

  ngOnInit() {
    this.dashboardService.currentExchanger$
      .subscribe((exchanger) => {
        this.exchanger = exchanger;
        this.bidTotalVolume = {total: 0, currency: this.exchanger.currencyPair.quoteCurrency};
        this.askTotalVolume = {total: 0, currency: this.exchanger.currencyPair.baseCurrency};
      });

    this.dashboardService.orderBook$
      .subscribe(({bid, ask}) => {
        if (bid.length) {
          this.bidTotalVolume.total = bid[bid.length - 1].volume * bid[bid.length - 1].price;
          this.bidTotalVolume.currency = this.exchanger.currencyPair.quoteCurrency;
        }

        if (ask.length) {
          this.askTotalVolume.total = ask[ask.length - 1].volume;
          this.askTotalVolume.currency = this.exchanger.currencyPair.baseCurrency;
        }
      });

    this.dashboardService.lastTrades$
    .subscribe((lastTrade) => {
      if (lastTrade) {
        this.lastPrice = lastTrade.price;
      }
    });

    this.lastTradesFailedSubscription$ = this.dashboardService.lastTradesFailed$.subscribe(
      value => {
        this.lastTradesFailed = value.valueOf();
      }
    );
  }


  ngOnDestroy(): void {
    this.lastTradesFailedSubscription$.unsubscribe();
  }
}
