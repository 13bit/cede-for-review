import {Component, OnDestroy, OnInit} from '@angular/core';
import {DashboardService} from '@app/dashboard/dashboard.service';
import {OrderBookItem} from '@app/shared/model/order-book-item';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-order-book-ask',
  templateUrl: './ask.component.html',
  styleUrls: ['./ask.component.css']
})
export class AskComponent implements OnInit, OnDestroy {
  ask: OrderBookItem[];
  askSubscription$: Subscription;

  constructor(private dashboardService: DashboardService) {
  }

  ngOnInit(): void {
    this.ask = [];
    this.askSubscription$ = this.dashboardService.orderBook$
      .subscribe(({ask}) => this.ask = ask);
  }

  ngOnDestroy(): void {
      this.askSubscription$.unsubscribe();
  }

}
