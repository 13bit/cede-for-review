import {Injectable} from '@angular/core';
import {Constants} from 'app/shared/constants';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {LastTrade} from '@app/shared/model/last-trade';
import * as moment from 'moment';
import {CurrencyPair} from '@app/shared/model/order/currency-pair';
import {OrderBook} from '@app/shared/model/order-book';

@Injectable()
export class StockService {
  private readonly REST_SERVICE_URL = Constants.rest_api_url;

  constructor(private http: HttpClient) {
  }

  getCurrencyPairs(stock: string): Observable<CurrencyPair[]> {
    return this.http.get<CurrencyPair[]>(`${this.REST_SERVICE_URL}/markets/${stock}`);
  }

  getLastTrades(stock: string, currencyPair: CurrencyPair): Observable<LastTrade[]> {
    return this.http
      .get<LastTrade[]>(
        `${this.REST_SERVICE_URL}/last-trades/${stock}/${currencyPair.baseCurrency}-${currencyPair.quoteCurrency}`
      )
      .pipe(map((lastTradesRaw: any) => {
        return lastTradesRaw.map((lastTradeRaw: any) => {
          return new LastTrade(
            lastTradeRaw.quantity,
            lastTradeRaw.price,
            moment.utc(lastTradeRaw.timestamp).valueOf(),
            lastTradeRaw.tradeType.toLowerCase()
          );
        });
      }));
  }

  getOrderBook(stock: string, currencyPair: CurrencyPair): Observable<OrderBook> {
    return this.http
      .get<any>(`${this.REST_SERVICE_URL}/order-book/${stock}/${currencyPair.baseCurrency}-${currencyPair.quoteCurrency}`);
  }
}
