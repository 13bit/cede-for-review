import * as moment from 'moment';
import {Moment} from 'moment';

export class LastTrade {
  quantity: number;
  price: number;
  time: Moment;
  timestamp: string|number;
  type: string;

  constructor(quantity: number, price: number, time: string|number, type: string) {
    this.quantity = quantity;
    this.price = price;
    this.timestamp = time;
    this.time = moment(time);
    this.type = type;
  }
}
