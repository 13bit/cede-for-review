import {OrderAggregate} from '@app/shared/model/order/order-aggregate';
import {PlatformOrder} from '@app/shared/model/order/platform-order';

export interface PlatformOrderUpdate {
  type: string;
  orderAggregate: OrderAggregate;
  selectedPlatformOrders: PlatformOrder[];
}
