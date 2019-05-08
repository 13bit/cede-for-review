import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'orderBookValue'
})
export class OrderBookValuePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const totalSymbols = 7;
    let result;
    let fractionPartLength;

    if (typeof value !== 'string') {
      value = String(value);
    }

    value = value.split('.');
    const integerPart = value[0];
    let fractionPart = value[1] || '0';

    if (integerPart.length >= totalSymbols) {
      result = integerPart;
    } else if (integerPart.length === (totalSymbols - 1)) {
      fractionPart = fractionPart[0];
    } else {
      fractionPartLength = (totalSymbols - integerPart.length);
      if (fractionPart.length < fractionPartLength) {
        fractionPart += '0'.repeat(fractionPartLength - fractionPart.length);
      }
    }

    if (integerPart.length < totalSymbols) {
      result = `${integerPart}.${fractionPart}`;
    }

    return result;
  }
}
