import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private jsonUrl = 'assets/categories.json';
  constructor(private http: HttpClient) {}

  /**
   * Should return an array of category objects.
   * @returns Observable<Category>
   */

  getCategories(): Observable<Category[]> {
    return this.http
      .get<{ categories: Category[] }>(this.jsonUrl)
      .pipe(map((response) => response.categories));
  }
}
