import {Observable} from 'rxjs';
import {LastTrade} from '@app/shared/model/last-trade';
import {OrderBook} from '@app/shared/model/order-book';

export interface DataProvider {
  stockName: string;

  lastTrades$: Observable<LastTrade>;
  orderBook$?: Observable<OrderBook>;

}
