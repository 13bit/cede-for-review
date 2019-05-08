import {Component, OnInit} from '@angular/core';
import {OrderAggregate} from '@app/shared/model/order/order-aggregate';
import {OrderService} from '@app/core/order.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {OrderHistoryDetailsComponent} from '@app/shared/modals/order-history/order-history-details.component';
import {PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
import {Constants} from '@app/shared';
import {OnDestroy} from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-orders-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit, OnDestroy {

  orders: OrderAggregate[] = [];
  ordersLength: number;
  public config: PerfectScrollbarConfigInterface = {};

  private refreshOrdersTask: any;

  constructor(private orderService: OrderService, private modalService: NgbModal) {
  }

  ngOnInit() {
    this.getOrders();
    this.orderService.ordersChange$.subscribe(value => {
      this.getOrders();
    });
    this.refreshOrdersTask = setInterval(x => {
      this.getOrders();
    }, Constants.orders_refresh_interval);
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshOrdersTask);
  }


  getOrders(): void {
    this.orderService.findOrders().subscribe(result => {
      this.orders = result;

      this.orders = this.sortOrders(this.orders);
      this.orders.forEach(value =>
        value.orderTime = new Date(Date.parse(value.orderTime + 'UTC')));
    }, err => {
    });
  }

  selectOrder(order: OrderAggregate): void {
    const modal: NgbModalRef = this.modalService.open(OrderHistoryDetailsComponent, {windowClass: 'order-history-details'});
    modal.componentInstance.order = order;
  }

  getTotalCurrency(order: OrderAggregate): String {
    return order.currencyPair.quoteCurrency;
  }

  private sortOrders(orders: OrderAggregate[]): OrderAggregate[] {
    return orders.sort((e1: OrderAggregate, e2: OrderAggregate): number => {
      if (e1.orderTime.getTime() > e2.orderTime.getTime()) {
        return -1;
      } else if (e1.orderTime.getTime() < e2.orderTime.getTime()) {
        return 1;
      }
      return 0;
    });
  }
}
