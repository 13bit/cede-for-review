import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'tenDigits'
})
export class TenDigitsPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const totalSymbols = 9;

    if (typeof value !== 'string') {
      value = String(value);
    }

    value = value.split('.');
    const integerPart = value[0];
    let fractionPart = value[1];

    const fractionPartLength = totalSymbols - integerPart.length;

    if (!fractionPart) {
      fractionPart = '0'.repeat(fractionPartLength);
    } else {
      fractionPart = fractionPart.slice(0, fractionPartLength);

      if (fractionPartLength > fractionPart.length) {
        fractionPart = fractionPart + '0'.repeat(fractionPartLength - fractionPart.length);
      }
    }

    return `${integerPart}.${fractionPart}`;
  }

}
