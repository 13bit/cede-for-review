import {Pipe, PipeTransform} from '@angular/core';
import {OrderStatus} from '@app/shared/model/order/order-status';
import {PlatformOrder} from '@app/shared/model/order/platform-order';

@Pipe({
  name: 'closedOrders'
})
export class ClosedOrdersPipe implements PipeTransform {

  transform(value: PlatformOrder[], args?: any): PlatformOrder[] {
    return value.filter(order => {
      return order.isCancelled || order.orderStatus === OrderStatus.closed;
    });
  }
}
