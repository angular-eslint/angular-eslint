import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ExamplePipe } from './example.pipe';
import { ExampleComponent } from './example.component';

@NgModule({
  declarations: [AppComponent, ExamplePipe, ExampleComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
