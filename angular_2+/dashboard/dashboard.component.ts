import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '@app/core';
import {OrderSide} from '@app/shared/model/order/order-side';
import {Constants, Wallet} from '@app/shared';
import {OrderService} from '@app/core/order.service';
import {DashboardService} from '@app/dashboard/dashboard.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [DashboardService]
})

export class DashboardComponent implements OnInit, OnDestroy {

  orderSide;
  wallets: Wallet[];
  userWalletsSubscription: Subscription;

  constructor(private dashboardService: DashboardService,
              private authService: AuthService,
              private orderService: OrderService) {
  }

  ngOnInit(): void {
    this.orderSide = OrderSide;
    this.getUsersWallets();
  }

  ngOnDestroy(): void {
    this.userWalletsSubscription.unsubscribe();
  }

  getUsersWallets(): void {
    this.userWalletsSubscription = this.orderService.getUsersWallets()
      .subscribe(wallets => this.wallets = wallets, err => {});
  }

  logout(): void {
    this.authService.logout(Constants.auto_logout);
  }
}
