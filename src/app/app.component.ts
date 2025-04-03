import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { BookListComponent } from './book-list/book-list.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, BookListComponent],
})
export class AppComponent {
  totalBooks: number = 0;
  constructor() {}
}
