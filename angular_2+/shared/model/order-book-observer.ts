import {OrderBookItem} from '@app/shared/model/order-book-item';
import {BehaviorSubject} from 'rxjs';

export class OrderBookObserver {
  bidObserver$: BehaviorSubject<OrderBookItem[]>;
  askObserver$: BehaviorSubject<OrderBookItem[]>;
}
