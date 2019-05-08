import {Injector} from '@angular/core';
import {Observable, Subscription, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {LastTrade} from 'app/shared/model/last-trade';
import * as moment from 'moment';
import * as SockJS from 'sockjs-client';
import {StompConfig, StompRService} from '@stomp/ng2-stompjs';
import {Message} from '@stomp/stompjs';
import {DataProvider} from '@app/core/data-providers/DataProvider';
import {StockService} from '@app/core/stock.service';
import {Constants} from '@app/shared';
import {CurrencyPair} from '@app/shared/model/order/currency-pair';
import {OrderBook} from '@app/shared/model/order-book';
import {OrderBookItem} from '@app/shared/model/order-book-item';

export class BittrexDataProvider implements DataProvider {
  stockName = 'bittrex';

  stockService: StockService;
  currencyPair: CurrencyPair;

  stompService: StompRService;
  lastTrades$: Observable<LastTrade>;

  orderBook$: Observable<OrderBook>;
  stompSubscription: Subscription;

  lastTradeRaw$: Subject<any>;
  orderBookRaw$: Subject<any>;

  constructor(private injector: Injector, currencyPair: CurrencyPair) {
    this.stockService = this.injector.get(StockService);
    this.currencyPair = currencyPair;

    this.stompService = this.injector.get(StompRService);

    this.stompService.config = this.getStompConfig();
    this.stompService.initAndConnect();

    this.lastTradeRaw$ = new Subject<any>();
    this.orderBookRaw$ = new Subject<any>();

    const currencyPairName = this.getStockCurrencyPairName(currencyPair);

    this.stompSubscription = this.stompService
      .subscribe(`/events/${this.stockName}/${currencyPairName}`)
      .pipe(map((message: Message) => JSON.parse(message.body)))
      .subscribe(({event, data}) => {
          switch (event) {
            case 'TRADE':
              return this.lastTradeRaw$.next(data);
            case 'ORDER_BOOK_UPDATE':
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
    let lastTradeSubscription: Subscription = null;

    this.lastTrades$ = new Observable<LastTrade>((observer) => {
      this.stockService.getLastTrades(this.stockName, currencyPair)
        .subscribe((lastTrades: LastTrade[]) => {
            lastTrades
              .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
              .map((lastTrade: LastTrade) => observer.next(lastTrade));

            lastTradeSubscription = this.lastTradeRaw$
              .pipe(map((data) => this.lastTradeMapper(data)))
              .subscribe(
                (lastTrade: LastTrade) => observer.next(lastTrade),
                (error) => observer.error(error)
              );
          },
          (error) => observer.error(error)
        );

      return () => {
        if (lastTradeSubscription) {
          lastTradeSubscription.unsubscribe();
        }

        this.unsubscribeFromStomp();
      };
    });
  }

  subscribeToOrderBook(currencyPair: CurrencyPair): void {
    let orderBookSubscription: Subscription = null;

    this.orderBook$ = new Observable<OrderBook>((observer) => {
      this.stockService.getOrderBook(this.stockName, currencyPair)
        .subscribe(({bid, ask}) => {
            bid = bid.map(({price, amount}) => new OrderBookItem(price, amount, false));
            ask = ask.map(({price, amount}) => new OrderBookItem(price, amount, false));

            observer.next({bid, ask});

            orderBookSubscription = this.orderBookRaw$
              .subscribe(({side, rate, quantity}) => {
                  const item = new OrderBookItem(rate, quantity);

                  (side === 'BUY')
                    ? observer.next({bid: [item], ask: []})
                    : observer.next({bid: [], ask: [item]});
                },
                (error) => observer.error(error)
              );
          },
          (error) => observer.error(error)
        );

      return () => {
        if (orderBookSubscription) {
          orderBookSubscription.unsubscribe();
        }

        this.unsubscribeFromStomp();
      };
    });
  }

  unsubscribeFromStomp(): void {
    if (!this.stompSubscription.closed) {
      this.stompSubscription.unsubscribe();
    }
  }

  getStompConfig(): StompConfig {
    const stompConfig: StompConfig = {      // Which server?
      url: new SockJS(Constants.ws_url),
      headers: {},
      heartbeat_in: 0, // Typical value 0 - disabled
      heartbeat_out: 20000, // Typical value 20000 - every 20 seconds
      reconnect_delay: 5000,
      // Will log diagnostics on console
      debug: false
    };

    return stompConfig;
  }

  lastTradeMapper(lastTradeRaw): LastTrade {
    return new LastTrade(
      lastTradeRaw.quantity,
      lastTradeRaw.price,
      moment.utc(lastTradeRaw.timestamp).valueOf(),
      lastTradeRaw.tradeType.toLowerCase()
    );
  }

  getStockCurrencyPairName(currencyPair: CurrencyPair): string {
    return `${currencyPair.quoteCurrency}-${currencyPair.baseCurrency}`;
  }

}
