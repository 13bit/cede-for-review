import {isBoolean} from 'util';

export class OrderBookItem {
  amount: number;
  price: number;
  total?: number;
  isNew: boolean;
  volume?: number;
  type?: string;

  constructor(price: number, amount: number, isNew?: boolean, type?: string) {
    this.amount = amount;
    this.price = price;
    this.total = this.calculateTotal();

    this.isNew = isBoolean(isNew) ? isNew : true;

    if (type === 'bid' || type === 'ask') {
      this.type = type;
    }
  }

  calculateTotal() {
    return parseFloat((this.price * this.amount).toFixed(2));
  }
}
