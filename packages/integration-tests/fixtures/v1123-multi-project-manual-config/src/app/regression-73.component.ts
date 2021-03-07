/**
 * Repro for https://github.com/angular-eslint/angular-eslint/issues/73
 * to ensure no future regressions
 */
import { Component } from '@angular/core';

const someDecorator = (x) => (y) => {};
@someDecorator({})
export class Foo {}

@Component({
  selector: 'app-regression-73',
  template: 'regression-73',
})
export class Regression73Component {}
