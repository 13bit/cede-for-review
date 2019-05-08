import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'exponentToFixed'
})
export class ExponentToFixedPipe implements PipeTransform {

  transform(value: number, args?: any): any {
    if (this.isExponent(value)) {
      return this.exponentToFixed(value);
    }

    return value;
  }

  isExponent(number: number): boolean {
    return number.toString().includes('e');
  }

  exponentToFixed(number: number): string {
    return number.toFixed(10);
  }
}
