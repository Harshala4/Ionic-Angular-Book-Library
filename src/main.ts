import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideZoneChangeDetection } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { bookReducer } from './app/states/book.reducer';
import { provideEffects } from '@ngrx/effects';
import { BookEffects } from './app/states/book.effects';
import { BookService } from './app/services/book.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideStore({ books: bookReducer }), // Provide NgRx Store globally
    provideEffects([BookEffects]), // Provide NgRx Effects for async actions
    BookService,
  ],
}).catch((err) => console.error(err));
