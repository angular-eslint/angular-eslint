import { Component } from '@angular/core';

@Component({
  selector: "app-one-inline-template",
  template: `
    <input type="text" name="foo" ([ngModel])="foo">
  `,
})
export class OneInlineTemplateComponent {}

@Component({
  selector: "app-two-inline-template",
  template: `
    <div [oneWay]="oneWay" (emitter)="emitter" ([twoWay])="twoWay"></div>
  `,
})
export class TwoInlineTemplateComponent {}
