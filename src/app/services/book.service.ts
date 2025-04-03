import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { BookApiResponse, BookDoc } from '../models/book.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private booksUrl = 'https://openlibrary.org/search.json?q=';

  private totalBooksSubject = new BehaviorSubject<number>(0);
  totalBooks$ = this.totalBooksSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeTotalBooks();
  }
  private initializeTotalBooks() {
    const savedBooks = JSON.parse(
      localStorage.getItem('books_yourCategory') || '[]'
    );
    this.totalBooksSubject.next(savedBooks.length);
  }

  getBooksByCategory(category: string = 'javascript'): Observable<BookDoc[]> {
    return this.http
      .get<BookApiResponse>(`${this.booksUrl}${category}&page=1`)
      .pipe(map((response) => response.docs || []));
  }
  updateTotalBooks(count: number) {
    this.totalBooksSubject.next(count);
  }
}
