import {CurrencyPair} from '@app/shared/model/order/currency-pair';

export class Exchanger {
  stock: string;
  currencyPair: CurrencyPair;

  constructor(stock: string, currencyPair: CurrencyPair) {
    this.stock = stock;
    this.currencyPair = currencyPair;
  }
}
