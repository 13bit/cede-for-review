import {Injectable} from '@angular/core';
import {CurrencyPair} from '@app/shared/model/order/currency-pair';

@Injectable()
export class CurrencyPairService {
  constructor() {
  }

  getDefaultCurrencyPairByStock(stock: string): CurrencyPair {
    switch (stock) {
      case 'binance':
        return {baseCurrency: 'BTC', quoteCurrency: 'USDT'};
      case 'bitstamp':
        return {baseCurrency: 'BTC', quoteCurrency: 'USD'};
      case 'bittrex':
        return {baseCurrency: 'BTC', quoteCurrency: 'USDT'};
      case 'demo_exchange':
        return {baseCurrency: 'BTC', quoteCurrency: 'USDT'};
      case 'bitfinex':
        return {baseCurrency: 'BTC', quoteCurrency: 'USD'};
      default:
        throw new Error(`${stock} is unknown`);
    }
  }

}
