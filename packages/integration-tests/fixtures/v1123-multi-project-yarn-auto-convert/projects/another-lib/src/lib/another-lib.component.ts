import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-another-lib',
  template: `
    <p>
      another-lib works!
    </p>
  `,
  styles: [
  ]
})
export class AnotherLibComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
