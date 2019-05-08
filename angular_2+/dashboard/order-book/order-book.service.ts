import {Injectable} from '@angular/core';
import {OrderBookItem} from '@app/shared/model/order-book-item';
import {LastTrade} from '@app/shared/model/last-trade';
import {OrderBook} from '@app/shared/model/order-book';
import {BehaviorSubject, Subscription, Observable, interval} from 'rxjs';
import {DataProvider} from '@app/core/data-providers/DataProvider';

@Injectable()
export class OrderBookService {

  orderBookBid$: BehaviorSubject<OrderBookItem[]>;
  orderBookAsk$: BehaviorSubject<OrderBookItem[]>;
  orderBookBuffer: { bidBuffer: OrderBookItem[], askBuffer: OrderBookItem[] };

  orderBook$: BehaviorSubject<OrderBook>;

  constructor() {
    this.orderBookBid$ = new BehaviorSubject<OrderBookItem[]>([]);
    this.orderBookAsk$ = new BehaviorSubject<OrderBookItem[]>([]);

    this.orderBookBuffer = {bidBuffer: [], askBuffer: []};

    this.orderBook$ = new BehaviorSubject<OrderBook>({bid: [], ask: []});
  }


  exchangerChanged(): void {
    this.orderBookBid$.next([]);
    this.orderBookAsk$.next([]);
    this.orderBookBuffer = {bidBuffer: [], askBuffer: []};
  }

  subscribeToOrderBook(dataProvider: DataProvider, lastTrades$: BehaviorSubject<LastTrade>): Observable<OrderBook> {
    return new Observable((observer) => {
      let orderBookBid = [];
      let orderBookAsk = [];

      const orderBookSubscription: Subscription = dataProvider.orderBook$
        .subscribe(
          ({bid: bidItems, ask: askItems}) => {
            bidItems
              .filter((item) => this.validateItemPrice(lastTrades$.getValue(), item))
              .map((item) => this.orderBookBuffer.bidBuffer.push(item));

            askItems
              .filter((item) => this.validateItemPrice(lastTrades$.getValue(), item))
              .map((item) => this.orderBookBuffer.askBuffer.push(item));
          },
          (error) => console.log(error)
        );

      const bufferCollectorSubscription: Subscription = interval(1000)
        .subscribe(() => {
          if (this.orderBookBuffer.bidBuffer.length || this.orderBookBuffer.askBuffer.length) {
            orderBookBid = this.prepareOrderBookItems(orderBookBid, this.orderBookBuffer.bidBuffer, 'desc');
            orderBookAsk = this.prepareOrderBookItems(orderBookAsk, this.orderBookBuffer.askBuffer, 'asc');

            observer.next({bid: orderBookBid, ask: orderBookAsk});
            this.orderBookBuffer = {bidBuffer: [], askBuffer: []};
          }
        });

      const cleanerSubscription: Subscription = interval(15000)
        .subscribe(() => {
          this.orderBookBid$.next(this.orderBookCleaner(this.orderBookBid$.getValue()));
          this.orderBookAsk$.next(this.orderBookCleaner(this.orderBookAsk$.getValue()));
        });

      return () => {
        this.orderBookBuffer = {bidBuffer: [], askBuffer: []};
        observer.next({bid: [], ask: []});
        orderBookBid = [];
        orderBookAsk = [];

        orderBookSubscription.unsubscribe();
        bufferCollectorSubscription.unsubscribe();
        cleanerSubscription.unsubscribe();
      };
    });
  }

  prepareOrderBookItems(currentState: OrderBookItem[], buffer: OrderBookItem[], orderType = 'asc') {
    let orderBookState = this.pushOrUpdateItems(currentState, buffer);
    orderBookState = this.sortItems(orderBookState, orderType);
    orderBookState = this.calculateVolume(orderBookState);

    return orderBookState;
  }

  pushOrUpdateItems(items: OrderBookItem[], newItems: OrderBookItem[]): OrderBookItem[] {
    const itemsCopy = items.slice();

    if (newItems.length > 0) {
      newItems.map((newItem) => {
        const nodeIndex = itemsCopy.findIndex((item) => item.price === newItem.price);

        if (nodeIndex >= 0) {
          itemsCopy[nodeIndex].amount = newItem.amount;
          itemsCopy[nodeIndex].isNew = false;
        } else {
          itemsCopy.push(newItem);
        }
      });
    }

    return itemsCopy;
  }

  sortItems(items: OrderBookItem[], type = 'asc'): OrderBookItem[] {
    return items.sort((a, b) => {
      if (type === 'asc') {
        return a.price - b.price;
      } else if (type === 'desc') {
        return b.price - a.price;
      }
    });
  }

  orderBookCleaner(items: OrderBookItem[]): OrderBookItem[] {
    if (items.length >= 200) {
      items = items.filter(({amount}) => amount > 0);
    }

    if (items.length >= 500) {
      items = items.slice(0, 500);
    }

    return items;
  }

  calculateVolume(orderBookItems: OrderBookItem[]): OrderBookItem[] {
    for (let i = 0; i <= orderBookItems.length - 1; i++) {
      if (i === 0) {
        orderBookItems[i].volume = orderBookItems[i].amount;
      } else {
        const volume = orderBookItems[i - 1].volume + orderBookItems[i].amount;
        orderBookItems[i].volume = parseFloat(volume.toFixed(8));
      }
    }

    return orderBookItems;
  }

  validateItemPrice(lastTrade: LastTrade, orderBookItem: OrderBookItem): boolean {
    if (!lastTrade) {
      return false;
    }

    const diffInPercentage = Math.floor(((orderBookItem.price - lastTrade.price) / lastTrade.price) * 100);

    return Math.abs(diffInPercentage) <= 5;
  }

  preparePriceScale({bid, ask}: OrderBook): number[] {
    const start = bid[bid.length - 1].price;
    const end = ask[ask.length - 1].price;

    return [start, end];
  }

  prepareVolumeScale({bid, ask}: OrderBook): number[] {
    const end = (bid[bid.length - 1].volume > ask[ask.length - 1].volume)
      ? bid[bid.length - 1].volume
      : ask[ask.length - 1].volume;


    return [0, end * 1.4];
  }
}
