import { createAction, props } from '@ngrx/store';
import { BookDoc } from '../models/book.model';

export const loadBooks = createAction(
  '[Book] Load Books',
  props<{ category: string }>()
);
export const loadBooksSuccess = createAction(
  '[Book] Load Books Success',
  props<{ books: BookDoc[] }>()
);
export const loadBooksFailure = createAction(
  '[Book] Load Books Failure',
  props<{ error: string }>()
);
export const setBooksFromLocalStorage = createAction(
  '[Book] Set Books From Local Storage',
  props<{ books: BookDoc[] }>()
);
export const addBook = createAction(
  '[Book] Add Book',
  props<{ book: BookDoc }>()
);
export const editBook = createAction(
  '[Book] Edit Book',
  props<{ book: BookDoc }>()
);
