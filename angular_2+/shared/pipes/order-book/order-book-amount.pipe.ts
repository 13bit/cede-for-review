import {Pipe, PipeTransform} from '@angular/core';
import {OrderBookBasePipe} from '@app/shared/pipes/order-book/order-book-base.pipe';

@Pipe({
  name: 'orderBookAmount'
})
export class OrderBookAmountPipe extends OrderBookBasePipe implements PipeTransform {
  maxLength = 7;

  transform(value: any, args?: any): any {
    if (typeof value !== 'string') {
      value = String(value);
    }

    value = value.split('.');
    const integerPart = value[0];
    let resultValue;

    if (integerPart.length === this.maxLength) {
      resultValue = integerPart;
    } else {
      const fractionPart = this.prepareFractionPart(
        value[1],
        this.maxLength - integerPart.length
      );

      resultValue = `${integerPart}.${fractionPart}`;
    }

    return resultValue;
  }

}
