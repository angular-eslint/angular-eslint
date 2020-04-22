import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ExamplePipe } from './example.pipe';
import { ExampleComponent } from './example.component';
import { Regression73Component } from './regression-73.component';

@NgModule({
  declarations: [AppComponent, ExamplePipe, ExampleComponent, Regression73Component],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
