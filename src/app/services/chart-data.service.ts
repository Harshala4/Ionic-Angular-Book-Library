import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChartDataService {
  private borrowedBooksByCategory = new BehaviorSubject<{ [key: string]: number }>({});
  private availableBooksByCategory = new BehaviorSubject<{ [key: string]: number }>({});

  borrowedBooksByCategory$ = this.borrowedBooksByCategory.asObservable();
  availableBooksByCategory$ = this.availableBooksByCategory.asObservable();

  updateChartData(borrowed: { [key: string]: number }, available: { [key: string]: number }) {
    this.borrowedBooksByCategory.next(borrowed);
    this.availableBooksByCategory.next(available);
  }
}