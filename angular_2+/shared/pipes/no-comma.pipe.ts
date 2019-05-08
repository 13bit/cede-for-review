import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'noComma'
})
export class NoCommaPipe implements PipeTransform {

  transform(value: number, ...args): any {
    if (value !== undefined && value !== null) {
      // here we just remove the commas from value
      return value.toString().replace(',', '');
    } else {
      return '';
    }
  }
}
