import {SharedModule} from '@app/shared';
import {NgModule} from '@angular/core';
import {DashboardComponent} from '@app/dashboard/dashboard.component';
import {DashboardRoutingModule} from '@app/dashboard/dashboard-routing.module';
import {TradingViewComponent} from './tradingview/tradingview.component';
import {OrderComponent} from '@app/dashboard/order/order.component';
import {LastTradesComponent} from './last-trades/last-trades.component';
import {StockCurrencyManagerComponent} from './stock-currency-manager/stock-currency-manager.component';
import {StompRService} from '@stomp/ng2-stompjs';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {WalletsManagementComponent} from './wallets-management/wallets-management.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {WalletBalanceComponent} from './wallets-management/wallet-balance/wallet-balance.component';
import {MomentModule} from 'ngx-moment';
import {OrderHistoryComponent} from '@app/dashboard/order-history/order-history.component';
import {OrderBookComponent} from './order-book/order-book.component';
import {BidComponent} from './order-book/bid/bid.component';
import {AskComponent} from './order-book/ask/ask.component';
import {OrderBookService} from './order-book/order-book.service';
import {DepthChartComponent} from './order-book/depth-chart/depth-chart.component';
import {D3DepthChartService} from './order-book/d3-depth-chart.service';

@NgModule({
  imports: [
    SharedModule,
    DashboardRoutingModule,
    PerfectScrollbarModule,
    MomentModule,
    NgbModule.forRoot()
  ],
  declarations: [
    DashboardComponent,
    TradingViewComponent,
    LastTradesComponent,
    StockCurrencyManagerComponent,
    WalletsManagementComponent,
    WalletBalanceComponent,
    OrderComponent,
    OrderHistoryComponent,
    OrderBookComponent,
    BidComponent,
    AskComponent,
    DepthChartComponent,
  ],
  providers: [
    StompRService,
    OrderBookService,
    D3DepthChartService
  ]
})
export class DashboardModule {
}
