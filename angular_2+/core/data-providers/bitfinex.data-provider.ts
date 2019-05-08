import {Injector} from '@angular/core';
import {SocketService} from 'app/core/socket.service';
import {Observable, Subscription, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {LastTrade} from 'app/shared/model/last-trade';
import {DataProvider} from '@app/core/data-providers/DataProvider';
import {Constants} from '@app/shared/constants';
import {StockService} from '@app/core/stock.service';
import {CurrencyPair} from '@app/shared/model/order/currency-pair';
import {OrderBook} from '@app/shared/model/order-book';
import {OrderBookItem} from '@app/shared/model/order-book-item';

export class BitfinexDataProvider implements DataProvider {
  stockName = 'bitfinex';

  currencyPair: CurrencyPair;
  stockService: StockService;

  socket: SocketService;

  lastTrades$: Observable<LastTrade>;

  orderBook$: Observable<OrderBook>;
  channelSubscription: Subscription;

  lastTradeRaw$: Subject<any>;
  orderBookRaw$: Subject<any>;

  constructor(private injector: Injector, currencyPair: CurrencyPair) {
    this.stockService = this.injector.get(StockService);
    this.currencyPair = currencyPair;

    this.socket = new SocketService(Constants.bitfinex_ws_url);

    this.lastTradeRaw$ = new Subject<any>();
    this.orderBookRaw$ = new Subject<any>();

    this.channelSubscription = this.socket.messages
      .pipe(map((data) => this.parseChannel(data)))
      .subscribe((data) => {
          if (data instanceof LastTrade) {
            return this.lastTradeRaw$.next(data);
          } else if (data instanceof OrderBookItem) {
            return this.orderBookRaw$.next(data);
          }
        },
        (error) => {
          this.lastTradeRaw$.error(error);
          this.orderBookRaw$.error(error);
        });

    this.subscribeToLastTrades(this.currencyPair);
    this.subscribeToOrderBook(this.currencyPair);
  }

  subscribeToLastTrades(currencyPair: CurrencyPair): void {
    const currencyPairName = this.getStockCurrencyPairName(currencyPair);

    this.lastTrades$ = new Observable<LastTrade>((observer) => {
      let lastTradeSubscription: Subscription = null;

      this.socket.send({
        event: 'subscribe',
        channel: 'trades',
        symbol: currencyPairName
      });

      this.stockService.getLastTrades(this.stockName, this.currencyPair)
        .subscribe((lastTrades: LastTrade[]) => {
            lastTrades
              .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
              .map((lastTrade: LastTrade) => observer.next(lastTrade));

            lastTradeSubscription = this.lastTradeRaw$
              .subscribe(
                (lastTrade: LastTrade) => observer.next(lastTrade),
                (error) => observer.error(error)
              );
          },
          (error) => observer.error(error));

      return () => {
        lastTradeSubscription.unsubscribe();
        if (this.channelSubscription) {
          this.channelSubscription.unsubscribe();
        }
      };
    });
  }

  subscribeToOrderBook(currencyPair: CurrencyPair): void {
    const currencyPairName = this.getStockCurrencyPairName(currencyPair);

    this.orderBook$ = new Observable<OrderBook>((observer) => {
      let orderBookSubscription: Subscription = null;

      this.socket.send({
        event: 'subscribe',
        channel: 'book',
        symbol: currencyPairName,
        freq: 'F0',
        len: 100
      });

      this.stockService.getOrderBook(this.stockName, this.currencyPair)
        .subscribe(({bid, ask}) => {
            bid = bid.map(({price, amount}) => new OrderBookItem(price, amount, false));
            ask = ask.map(({price, amount}) => new OrderBookItem(price, amount, false));

            observer.next({bid, ask});

            orderBookSubscription = this.orderBookRaw$
              .subscribe((item: OrderBookItem) => {
                  item.type === 'bid'
                    ? observer.next({bid: [item], ask: []})
                    : observer.next({bid: [], ask: [item]});
                },
                (error) => observer.error(error)
              );
          },
          (error) => observer.error(error));

      return () => {
        orderBookSubscription.unsubscribe();
        if (this.channelSubscription) {
          this.channelSubscription.unsubscribe();
        }
      };
    });
  }

  lastTradeMapper(lastTradeRaw: any): LastTrade {
    return new LastTrade(
      Math.abs(lastTradeRaw[2]),
      lastTradeRaw[3],
      lastTradeRaw[1],
      lastTradeRaw[2] > 0 ? 'buy' : 'sell'
    );
  }

  orderBookMapper(orderBookRaw: any): OrderBookItem {
    return new OrderBookItem(
      orderBookRaw[0],
      (orderBookRaw[1] === 0) ? 0 : Math.abs(orderBookRaw[2]),
      true,
      orderBookRaw[2] > 0 ? 'bid' : 'ask'
    );
  }

  getStockCurrencyPairName(currencyPair: CurrencyPair): string {
    return `t${currencyPair.baseCurrency}${currencyPair.quoteCurrency}`;
  }

  parseChannel(data: any): LastTrade | OrderBookItem {
    data = JSON.parse(data) || [];

    if (data.length === 3 && data[1] === 'tu') {
      return this.lastTradeMapper(data[2]);
    } else if (data.length === 2
      && Number.isInteger(data[0])
      && Array.isArray(data[1])
      && data[1].length === 3) {
      return this.orderBookMapper(data[1]);
    }
  }
}
