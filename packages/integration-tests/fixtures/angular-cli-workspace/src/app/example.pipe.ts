import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'example',
})
export class ExamplePipe {
  transform(value: any, args?: any): any {
    return null;
  }
}
