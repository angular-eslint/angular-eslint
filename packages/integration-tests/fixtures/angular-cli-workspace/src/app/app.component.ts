import { Component } from '@angular/core';
import {} from 'rxjs/Rx';

console.log('hello');
console.debug('hello');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular-eslint-example';

  ngOnInit() {
    console.log('Hello, ESLint!');
  }
}
