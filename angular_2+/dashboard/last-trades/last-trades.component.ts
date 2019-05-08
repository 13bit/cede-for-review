import {Component, OnDestroy, OnInit} from '@angular/core';
import {LastTrade} from '@app/shared/model/last-trade';
import {DashboardService} from '@app/dashboard/dashboard.service';
import {Subscription} from 'rxjs';
import {isNull} from 'util';
import {Constants} from '@app/shared';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';

@Component({
  selector: 'app-last-trades',
  templateUrl: './last-trades.component.html',
  styleUrls: ['./last-trades.component.css']
})
export class LastTradesComponent implements OnInit, OnDestroy {
  lastTrades: LastTrade[] = [];
  private lastTradeSubscription: Subscription;
  public config: PerfectScrollbarConfigInterface = {};
  lastTradesFailed: boolean;
  private lastTradesFailedSubscription$: Subscription;

  constructor(private dashboardService: DashboardService) {
  }

  ngOnInit() {
    this.lastTradeSubscription = this.dashboardService.lastTrades$
      .subscribe((lastTrade: LastTrade) => isNull(lastTrade) ? this.lastTrades = [] : this.addLastTradeItem(lastTrade));

    setTimeout(
      () => setInterval(() => this.cleanOldLastTrades(), Constants.last_trade_clean_timeout),
      Constants.last_trade_clean_timeout
    );
    this.lastTradesFailedSubscription$ = this.dashboardService.lastTradesFailed$.subscribe(lastTradeFailed => {
      this.lastTradesFailed = lastTradeFailed.valueOf();
    });
  }

  ngOnDestroy(): void {
    this.lastTradeSubscription.unsubscribe();
    this.lastTradesFailedSubscription$.unsubscribe();
  }

  addLastTradeItem(lastTrade: LastTrade): void {
    this.lastTrades.unshift(lastTrade);
  }

  cleanOldLastTrades(): void {
    const numberElementsForRemove = this.lastTrades.length - Constants.last_trade_store_amount;

    this.lastTrades = this.lastTrades.slice(0, -numberElementsForRemove);
  }


}
