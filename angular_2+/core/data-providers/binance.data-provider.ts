import {Injector} from '@angular/core';
import {SocketService} from 'app/core/socket.service';
import {Observable, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {LastTrade} from 'app/shared/model/last-trade';
import {DataProvider} from '@app/core/data-providers/DataProvider';
import {Constants} from '@app/shared/constants';
import {StockService} from '@app/core/stock.service';
import {CurrencyPair} from '@app/shared/model/order/currency-pair';
import {OrderBook} from '@app/shared/model/order-book';
import {OrderBookItem} from '@app/shared/model/order-book-item';

export class BinanceDataProvider implements DataProvider {
  stockName = 'binance';

  currencyPair: CurrencyPair;
  stockService: StockService;
  lastTrades$: Observable<LastTrade>;

  orderBook$: Observable<OrderBook>;

  constructor(private injector: Injector, currencyPair: CurrencyPair) {
    this.stockService = this.injector.get(StockService);
    this.currencyPair = currencyPair;

    this.subscribeToLastTrades(this.currencyPair);
    this.subscribeToOrderBook(this.currencyPair);
  }

  subscribeToLastTrades(currencyPair: CurrencyPair): void {
    const currencyPairName = this.getStockCurrencyPairName(currencyPair);
    const socket = new SocketService(`${Constants.binance_ws_url}${currencyPairName}@aggTrade.b10`);

    this.lastTrades$ = new Observable<LastTrade>((observer) => {
      let socketSubscription: Subscription = null;

      this.stockService.getLastTrades(this.stockName, this.currencyPair)
        .subscribe((lastTrades: LastTrade[]) => {
            lastTrades
              .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
              .map((lastTrade: LastTrade) => observer.next(lastTrade));

            socketSubscription = socket.messages
              .pipe(
                map((data) => this.deserialize(data)),
                map((lastTradeRaw) => new LastTrade(lastTradeRaw.q, lastTradeRaw.p, lastTradeRaw.T, lastTradeRaw.m ? 'sell' : 'buy'))
              )
              .subscribe(
                (lastTrade: LastTrade) => observer.next(lastTrade),
                (error) => observer.error(error)
              );
          },
          (error) => observer.error(error)
        );

      return () => {
        if (socketSubscription) {
          socketSubscription.unsubscribe();
        }
      };
    });
  }

  subscribeToOrderBook(currencyPair: CurrencyPair): void {
    const currencyPairName = this.getStockCurrencyPairName(currencyPair);
    const socket = new SocketService(`${Constants.binance_ws_url}${currencyPairName}@depth.b10`);

    this.orderBook$ = new Observable<OrderBook>((observer) => {
      let socketSubscription: Subscription = null;

      this.stockService.getOrderBook(this.stockName, currencyPair)
        .subscribe(({bid, ask}) => {
            bid = bid.map(({price, amount}) => new OrderBookItem(price, amount, false));
            ask = ask.map(({price, amount}) => new OrderBookItem(price, amount, false));

            observer.next({bid, ask});

            socketSubscription = socket.messages
              .pipe(map((data) => this.deserialize(data)))
              .subscribe(({b: bidFromWS, a: askFromWS}) => {
                  bidFromWS = bidFromWS.map(([price, amount]) => new OrderBookItem(parseFloat(price), parseFloat(amount)));
                  askFromWS = askFromWS.map(([price, amount]) => new OrderBookItem(parseFloat(price), parseFloat(amount)));

                  observer.next({bid: bidFromWS, ask: askFromWS});
                },
                (error) => observer.error(error)
              );
          },
          (error) => observer.error(error)
        );

      return () => {
        if (socketSubscription) {
          socketSubscription.unsubscribe();
        }
      };
    });
  }

  protected deserialize(data: string): any {
    return JSON.parse(data);
  }

  getStockCurrencyPairName(currencyPair: CurrencyPair): string {
    return `${currencyPair.baseCurrency}${currencyPair.quoteCurrency}`.toLowerCase();
  }

}
