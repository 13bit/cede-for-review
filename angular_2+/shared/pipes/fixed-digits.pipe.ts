import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'fixedDigits'
})
export class FixedDigitsPipe implements PipeTransform {

  transform(value: any, params: string | any): any {
    let fractionPartLength;
    let maxLength;

    params = params.split(',');

    if (params[0]) {
      maxLength = Number(params[0]);
    }
    if (params[1]) {
      fractionPartLength = Number(params[1]);
    }

    if (typeof value !== 'string') {
      value = String(value);
    }

    value = value.split('.');
    const integerPart = value[0];
    let fractionPart = value[1];

    if (!fractionPartLength) {
      fractionPartLength = maxLength - integerPart.length;
    }

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
