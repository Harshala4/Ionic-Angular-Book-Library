import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BookService } from '../services/book.service';
import { catchError, map } from 'rxjs/operators';
import { of, switchMap } from 'rxjs';
import { loadBooks, loadBooksSuccess, loadBooksFailure } from './book.action';
import { BookDoc } from '../models/book.model';

@Injectable()
export class BookEffects {
  private actions$ = inject(Actions);
  private bookService = inject(BookService);

  loadBooks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadBooks),
      switchMap((action) => {
        // Check local storage first
        const storedBooks = localStorage.getItem(`books_${action.category}`);
        if (storedBooks) {
          const books: BookDoc[] = JSON.parse(storedBooks || 'null');
          const updatedBooks = books.map((book: BookDoc) => ({
            ...book,
            inventoryStatus: book.inventoryStatus || 'Available',
            selected: false, // Ensure 'selected' is initialized
          }));
          // You might filter by category if needed, or just return all
          return of(
            loadBooksSuccess({
              books: updatedBooks.map((book: BookDoc) => ({
                author_key: book.author_key || [],
                author_name: book.author_name || [],
                first_publish_year: book.first_publish_year || 0,
                title: book.title || '',
                inventoryStatus: book.inventoryStatus || 'Available',
                subtitle: book.subtitle || '',
                selected: false, // Ensure 'selected' is initialized
              })),
            })
          );
        } else {
          // Fetch from API if local storage is empty
          return this.bookService.getBooksByCategory(action.category).pipe(
            map((response) => {
              const docs: BookDoc[] = response.map((doc: BookDoc) => ({
                author_key: doc.author_key,
                author_name: doc.author_name,
                first_publish_year: doc.first_publish_year,
                title: doc.title,
                inventoryStatus: 'Available',
                subtitle: doc.subtitle,
                selected: false, // Ensure 'selected' is initialized
              }));
              localStorage.setItem(
                `books_${action.category}`,
                JSON.stringify(docs)
              );
              return loadBooksSuccess({ books: docs });
            }),
            catchError((error) => of(loadBooksFailure({ error })))
          );
        }
      })
    )
  );
}
