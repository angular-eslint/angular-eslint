import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-example',
  template: `
    <input type="text" name="foo" ([ngModel])="foo">

    <app-item ([bar])="bar" ([item])="item" [(test)]="test"></app-item>
    <div [oneWay]="oneWay" (emitter)="emitter" ([twoWay])="twoWay"></div>
  `,
  styleUrls: ['./example.component.scss'],
  inputs: [],
  outputs: [],
  host: {}
})
export class ExampleComponent implements OnInit {

  @Output() onFoo = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
