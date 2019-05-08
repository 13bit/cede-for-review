import {Injector} from '@angular/core';
import {Observable} from 'rxjs';
import {LastTrade} from 'app/shared/model/last-trade';
import {DataProvider} from '@app/core/data-providers/DataProvider';
import {Constants} from '@app/shared';
import {StockService} from '@app/core/stock.service';
import {CurrencyPair} from '@app/shared/model/order/currency-pair';
import {OrderBook} from '@app/shared/model/order-book';
import {OrderBookItem} from '@app/shared/model/order-book-item';

declare const Pusher: any;

export class BitStampDataProvider implements DataProvider {
  stockName = 'bitstamp';

  pusher: any;

  stockService: StockService;
  currencyPair: CurrencyPair;
  lastTrades$: Observable<LastTrade>;

  orderBook$: Observable<OrderBook>;

  constructor(private injector: Injector, currencyPair: CurrencyPair) {
    this.pusher = new Pusher(Constants.bitstamp_api_key);
    this.stockService = this.injector.get(StockService);

    this.currencyPair = currencyPair;

    this.subscribeToLastTrades(this.currencyPair);
    this.subscribeToOrderBook(this.currencyPair);
  }

  subscribeToLastTrades(currencyPair: CurrencyPair): void {
    const channel = this.pusher.subscribe(this.getChannelNameForLastTrades(currencyPair));

    this.lastTrades$ = new Observable<LastTrade>((observer) => {
      this.stockService.getLastTrades(this.stockName, this.currencyPair)
        .subscribe((lastTrades: LastTrade[]) => {
            lastTrades
              .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
              .map((lastTrade: LastTrade) => observer.next(lastTrade));

            channel.bind('trade', (lastTradeRaw) => {
              observer.next(new LastTrade(
                lastTradeRaw.amount,
                lastTradeRaw.price,
                Number(`${lastTradeRaw.timestamp}000`),
                lastTradeRaw.type === 0 ? 'buy' : 'sell')
              );
            });

            channel.bind('pusher:subscription_error', (status) => {
              observer.error(new Error('Subscription to chanel failed'));
            });
          },
          (error) => observer.error(error)
        );

      return () => {
        channel.unbind('trade');
        channel.unsubscribe(this.getChannelNameForLastTrades(this.currencyPair));
      };
    });
  }

  subscribeToOrderBook(currencyPair: CurrencyPair): void {
    const channel = this.pusher.subscribe(this.getChannelNameForOrderBook(currencyPair));

    this.orderBook$ = new Observable<OrderBook>((observer) => {
      this.stockService.getOrderBook(this.stockName, currencyPair)
        .subscribe(({bid, ask}) => {
            bid = bid.map(({price, amount}) => new OrderBookItem(price, amount, false));
            ask = ask.map(({price, amount}) => new OrderBookItem(price, amount, false));

            observer.next({bid, ask});

            channel.bind('data', ({bids, asks}) => {
              bids = bids.map(([price, amount]) => new OrderBookItem(parseFloat(price), parseFloat(amount)));
              asks = asks.map(([price, amount]) => new OrderBookItem(parseFloat(price), parseFloat(amount)));

              observer.next({bid: bids, ask: asks});
            });

            channel.bind('pusher:subscription_error', (status) => {
              observer.error(new Error('Subscription to chanel failed'));
            });

          },
          (error) => observer.error(error)
        );

      return () => {
        channel.unbind('data');
        channel.unsubscribe(this.getChannelNameForOrderBook(this.currencyPair));
      };
    });
  }

  getChannelNameForLastTrades({baseCurrency, quoteCurrency}: CurrencyPair): string {
    if (baseCurrency === 'BTC' && quoteCurrency === 'USD') {
      return `live_trades`;
    }

    return `live_trades_${baseCurrency.toLowerCase()}${quoteCurrency.toLowerCase()}`;
  }

  getChannelNameForOrderBook({baseCurrency, quoteCurrency}: CurrencyPair): string {
    if (baseCurrency === 'BTC' && quoteCurrency === 'USD') {
      return `diff_order_book`;
    }

    return `diff_order_book_${baseCurrency.toLowerCase()}${quoteCurrency.toLowerCase()}`;
  }

}
