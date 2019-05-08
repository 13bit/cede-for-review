import {Component, OnDestroy, OnInit} from '@angular/core';
import {DashboardService} from '@app/dashboard/dashboard.service';
import {OrderBookItem} from '@app/shared/model/order-book-item';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-order-book-bid',
  templateUrl: './bid.component.html',
  styleUrls: ['./bid.component.css'],
})
export class BidComponent implements OnInit, OnDestroy {
  bid: OrderBookItem[];
  bidSubscription$: Subscription;

  constructor(private dashboardService: DashboardService) {
  }

  ngOnInit(): void {
    this.bid = [];

    this.bidSubscription$ = this.dashboardService.orderBook$
      .subscribe(({bid}) => this.bid = bid);
  }

  ngOnDestroy(): void {
      this.bidSubscription$.unsubscribe();
  }
}
