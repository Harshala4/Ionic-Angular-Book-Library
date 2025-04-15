import { Routes } from '@angular/router';
import { BookListComponent } from './book-list/book-list.component';
import { BookFormComponent } from './book-form/book-form.component';
import { CategorySelectorComponent } from './category-selector/category-selector.component';
import { CatChartComponent } from './category-selector/cat-chart/cat-chart.component';
import { HeaderComponent } from './header/header.component';
import { TabsComponent } from './tabs/tabs.component';

export const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: '/book-list',
  //   pathMatch: 'full',
  // },
  // {
  //   path: 'categories',
  //   component: CategorySelectorComponent,
  // },
  // {
  //   path: 'books/:category',
  //   component: BookListComponent,
  // },
  // {
  //   path: 'add-book',
  //   component: BookFormComponent,
  // },
  // {
  //   path: 'edit-book/:authorKey',
  //   component: BookFormComponent,
  // },
  // {
  //   path: 'book-list',
  //   component: BookListComponent,
  // },
  {
    path: '',
    redirectTo: 'tabs/book-list',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    component: TabsComponent,
    children: [
      {
        path: 'book-list',
        component: BookListComponent
      },
      {
        path: 'chart',
        component: CatChartComponent
      },
      {
        path: '',
        redirectTo: 'book-list',
        pathMatch: 'full'
      }
    ]
  }
];
