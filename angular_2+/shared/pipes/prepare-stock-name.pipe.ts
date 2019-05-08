import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'prepareStockName'
})
export class PrepareStockNamePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (this.hasUnderscore(value)) {
      value = value.replace('_', ' ');
    }

    return value;
  }

  hasUnderscore(value: string): boolean {
    return value.indexOf('_') >= 0 ? true : false;
  }

}
