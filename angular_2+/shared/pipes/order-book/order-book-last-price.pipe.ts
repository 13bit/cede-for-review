import {Pipe, PipeTransform} from '@angular/core';
import {OrderBookBasePipe} from '@app/shared/pipes/order-book/order-book-base.pipe';

@Pipe({
  name: 'orderBookLastPrice'
})
export class OrderBookLastPricePipe extends OrderBookBasePipe implements PipeTransform {
  maxLength = 8;

  transform(value: any, args?: any): any {
    if (typeof value !== 'string') {
      value = String(value);
    }

    value = value.split('.');
    const integerPart = value[0];
    const fractionPartLength = (integerPart.length > 1) ? 4 : this.maxLength - integerPart.length;

    const fractionPart = this.prepareFractionPart(value[1], fractionPartLength);

    return `${integerPart}.${fractionPart}`;
  }
}
