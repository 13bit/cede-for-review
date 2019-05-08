import {OrderStatus} from '@app/shared/model/order/order-status';
import {OrderSide} from '@app/shared/model/order/order-side';
import {PlatformOrder} from '@app/shared/model/order/platform-order';
import {OrderWallet} from '@app/shared/model/order/order-wallet';
import {CurrencyPair} from '@app/shared/model/order/currency-pair';

export class OrderAggregate {
  id?: number;
  traderId?: number;
  rate?: number;
  quantity?: number;
  orderStatus?: OrderStatus;
  side?: OrderSide;
  orderTime?: Date;
  total?: number;
  isPercentage?: boolean;
  wallets?: OrderWallet[];
  currencyPair: CurrencyPair;
  platformOrders?: PlatformOrder[];


  constructor(id: number, traderId: number, rate: number, quantity: number,
              orderStatus: OrderStatus, side: OrderSide, orderTime: Date,
              total: number, isPercentage: boolean, wallets: OrderWallet[],
              currencyPair: CurrencyPair, platformOrders: PlatformOrder[]) {
    this.id = id;
    this.traderId = traderId;
    this.rate = rate;
    this.quantity = quantity;
    this.orderStatus = orderStatus;
    this.side = side;
    this.orderTime = orderTime;
    this.total = total;
    this.isPercentage = isPercentage;
    this.wallets = wallets;
    this.currencyPair = currencyPair;
    this.platformOrders = platformOrders;
  }

  public static emptyOrderAggregate(orderSide: OrderSide): OrderAggregate {
    return new OrderAggregate(null, null, 0, 0,
      null, orderSide, null, 0, false, [],
      null, []);
  }
}
