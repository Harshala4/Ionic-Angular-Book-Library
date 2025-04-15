import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { BookFormComponent } from '../book-form/book-form.component';
import { CategorySelectorComponent } from '../category-selector/category-selector.component';
import { CatChartComponent } from '../category-selector/cat-chart/cat-chart.component';
import { HeaderComponent } from '../header/header.component';
import { BookDoc } from '../models/book.model';
import { BookService } from '../services/book.service';
import { Store, select } from '@ngrx/store';
import {
  addBook,
  editBook,
  loadBooks,
  setBooksFromLocalStorage,
} from '../states/book.action';
import { filter, map, Observable, of, take } from 'rxjs';
import { BookState } from '../states/book.reducer';
import { HttpClient } from '@angular/common/http';
import { distinctUntilChanged } from 'rxjs/operators';
import { DialogService } from '../services/dialog.service';
import { ChartDataService } from '../services/chart-data.service';

interface Column {
  field: string;
  header: string;
}

interface Status {
  label: string;
  value: string;
}

@Component({
  standalone: true,
  selector: 'app-book-list',
  imports: [
    FormsModule,
    CommonModule,
    IonicModule,
    BookFormComponent,
    CategorySelectorComponent,
    HeaderComponent,
  ],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
})
export class BookListComponent implements OnInit {
  selectAll: boolean = false;

  loading: boolean = false;
  cols!: Column[];
  selectedBooks: BookDoc[] = [];
  books: BookDoc[] = [];
  tableBooks: BookDoc[] = [];
  category: string = '';
  statuses: Status[] = [];
  books$: Observable<BookDoc[]> = of([]);
  loading$!: Observable<boolean>;
  error$!: unknown;
  selectedBook: BookDoc | null = null;
  isEditMode: boolean = false;
  totalBooks: number = 0;
  @Output() totalBooksChange = new EventEmitter<number>();

  private bookService = inject(BookService);
  private cd = inject(ChangeDetectorRef);

  displayDialog: boolean = false; // For Add Book dialog
  editDialog: boolean = false;

  constructor(
    private store: Store<{ books: BookState }>,
    private http: HttpClient,
    private alertController: AlertController, // Inject AlertController
    private toastController: ToastController, // Inject ToastController
    private dialogService: DialogService, // Inject DialogService
    private chartDataService: ChartDataService
  ) {
    this.books$ = this.store.pipe(
      select((state) => state.books.books),
      map((books) => books ?? [])
    );
    console.log(this.books$);
  }

  ngOnInit(): void {
    console.log('Category:', this.category);
    // this.loadBooksFromLocalStorage();
    // this.loadCategoriesAndCalculateBorrowedTrends();
    // this.store.dispatch(loadBooks({ category: this.category }));
    if (this.category && this.category.trim() !== '') {
      this.loadBooksFromLocalStorage();
      this.loadCategoriesAndCalculateBorrowedTrends();
    } else {
      console.warn('Category is not set. Skipping initial book loading.');
    }

    this.cols = [
      { field: 'author_key', header: 'Author Key' },
      { field: 'title', header: 'Title' },
      { field: 'author_name', header: 'Author Name' },
      { field: 'first_publish_year', header: 'Year' },
    ];

    this.statuses = [
      { label: 'Available', value: 'Available' },
      { label: 'Checked Oot', value: 'Checked Out' },
    ];

    this.books$.subscribe((books) => {
      this.totalBooks = books.length;
      this.totalBooksChange.emit(this.totalBooks);
    });

    this.dialogService.openDialog$.subscribe(() => {
      this.openNew(); // Call the method to open the dialog
    });
  }

  /**
   * 1. Method to read books from local storage.
   * 2. Udpate the available status for each of the books.
   */

  loadBooksFromLocalStorage(): void {
    if (!this.category || this.category.trim() === '') {
      console.warn('Category is not set. Skipping local storage operations.');
      return; // Exit the method if the category is invalid
    }

    console.log('Loading started...');
    this.loading = true;

    const storageKey = `books_${this.category}`;
    let storedBooks: BookDoc[] = [];

    try {
      const rawData = localStorage.getItem(storageKey);
      storedBooks = rawData ? JSON.parse(rawData) : [];

      if (!Array.isArray(storedBooks)) {
        console.error(
          `Invalid data in localStorage for ${storageKey}:`,
          rawData
        );
        storedBooks = [];
      }
    } catch (error) {
      console.error(`Error parsing localStorage for ${storageKey}:`, error);
      storedBooks = [];
    }

    if (storedBooks.length > 0) {
      this.books = storedBooks.map((book) => ({
        ...book,
        author_key: book.author_key || [],
        author_name: book.author_name || [],
        first_publish_year: book.first_publish_year || 0,
        title: book.title || '',
        inventoryStatus: book.inventoryStatus || 'Available',
        subtitle: book.subtitle || '',
        selected: false, // Ensure 'selected' is initialized
      }));

      this.tableBooks = [...this.books];

      console.log(`Books from local storage (${storageKey}):`, this.books);

      // Store books in NgRx Store
      this.store.dispatch(setBooksFromLocalStorage({ books: this.books }));

      this.cd.detectChanges(); // Ensure UI updates
      this.updateTable();
      this.calculateBorrowedAndAvailableTrends([this.category]);
      this.loading = false;
      console.log('Loading finished.');
    } else {
      // If no books in local storage, fetch from store
      this.books = [];
      this.tableBooks = [];
      this.store.dispatch(loadBooks({ category: this.category }));

      this.books$
        .pipe(
          take(2), // Ensure single execution
          filter(() => !!this.category), // Ensure category is valid
          distinctUntilChanged() // Prevent duplicate emissions
        )
        .subscribe({
          next: (books) => {
            const scopedBooks = books.map((book) => ({
              ...book,
              author_key: book.author_key || [],
              author_name: book.author_name || [],
              first_publish_year: book.first_publish_year || 0,
              title: book.title || '',
              inventoryStatus: book.inventoryStatus || 'Available',
              subtitle: book.subtitle || '',
              selected: false, // Ensure 'selected' is initialized
            }));

            this.books = scopedBooks;
            this.tableBooks = [...this.books];
            console.log(`Books from store (${storageKey}):`, scopedBooks);
            localStorage.setItem(storageKey, JSON.stringify(scopedBooks));

            this.cd.detectChanges();
            this.updateTable();
            this.calculateBorrowedAndAvailableTrends([this.category]);
            this.loading = false;
            console.log('Loading finished.');
          },
          error: (err) => {
            console.error(`Error loading books from store:`, err);
            this.loading = false; // Stop loading on error
          },
        });
    }
  }

  onCategoryChange(category: string) {
    if (!category || category.trim() === '') {
      console.warn('Invalid category selected. Skipping book loading.');
      return;
    }

    this.loading = true;
    this.books = [];
    this.tableBooks = [];
    this.category = category;

    this.cd.detectChanges();

    this.loadBooksFromLocalStorage();
    this.calculateBorrowedAndAvailableTrends([this.category]);
    this.bookService.updateTotalBooks(this.books.length);
  }

  async deleteSelectedBooks() {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure you want to delete selected books?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            const selectedIds = this.selectedBooks.map(
              (book) => book.author_key
            );
            this.books = this.books.filter(
              (book) => !selectedIds.includes(book.author_key)
            );
            localStorage.setItem(
              `books_${this.category}`,
              JSON.stringify(this.books)
            );
            this.selectedBooks = [];
            this.showToast('Books Deleted', 'success');
            this.tableBooks = [...this.books];
            this.updateTable();
            this.calculateBorrowedAndAvailableTrends([this.category]);
            this.bookService.updateTotalBooks(this.books.length);
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteBook(book: BookDoc) {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: `Are you sure you want to delete ${book.title}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.books = this.books.filter(
              (b) => b.author_key !== book.author_key
            );
            localStorage.setItem(
              `books_${this.category}`,
              JSON.stringify(this.books)
            );
            this.showToast('Book Deleted', 'success');
            this.tableBooks = [...this.books];
            this.updateTable();
            this.calculateBorrowedAndAvailableTrends([this.category]);
            this.bookService.updateTotalBooks(this.books.length);
          },
        },
      ],
    });

    await alert.present();
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
    });
    await toast.present();
  }

  getSeverity(status: string) {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Checked Out':
        return 'danger';
      default:
        return 'info';
    }
  }
  onFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value.toLowerCase();

    // Filter the books based on the query
    this.tableBooks = this.books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author_key?.[0]?.toLowerCase().includes(query) ||
        book.author_name?.[0]?.toLowerCase().includes(query) ||
        (book.first_publish_year?.toString() ?? '').includes(query) // Handle undefined
    );
  }

  updateBookStatus(book: BookDoc, newStatus: string) {
    book.inventoryStatus = newStatus;

    // Then persist the updated array in localStorage
    localStorage.setItem(`books_${this.category}`, JSON.stringify(this.books));
    this.updateTable();
    this.calculateBorrowedAndAvailableTrends([this.category]);
  }

  toggleBookStatus(book: BookDoc) {
    const updatedBook = {
      ...book,
      inventoryStatus:
        book.inventoryStatus === 'Available' ? 'Checked Out' : 'Available',
    };

    const index = this.books.findIndex((b) => b.author_key === book.author_key);
    if (index !== -1) {
      // this.books[index] = updatedBook;
      this.books = [
        ...this.books.slice(0, index),
        updatedBook,
        ...this.books.slice(index + 1),
      ];
      this.tableBooks = [...this.books];
    }

    localStorage.setItem(`books_${this.category}`, JSON.stringify(this.books));
    this.updateTable();
    this.calculateBorrowedAndAvailableTrends([this.category]);
  }

  openNew() {
    this.selectedBook = null; // Reset form for new book
    this.isEditMode = false;
    this.displayDialog = true;
    this.editDialog = false;
    console.log('ADD');
  }
  editBook(book: BookDoc) {
    this.isEditMode = true;
    this.selectedBook = { ...book };
    this.editDialog = true;
    this.displayDialog = false;
  }

  onCancelDialog() {
    this.displayDialog = false;
    this.editDialog = false;
  }

  saveBook(book: BookDoc) {
    const authorKey = Array.isArray(book.author_key)
      ? book.author_key[0]
      : book.author_key;

    const index = this.books.findIndex((b) => {
      const bKey = Array.isArray(b.author_key) ? b.author_key[0] : b.author_key;
      return bKey === authorKey;
    });

    if (this.isEditMode && index !== -1) {
      // this.books[index] = book;
      this.books = [
        ...this.books.slice(0, index),
        { ...book },
        ...this.books.slice(index + 1),
      ];
      this.store.dispatch(editBook({ book }));
      this.showToast('Book Updated', 'success');
    } else {
      // this.books.push(book);
      this.books = [...this.books, { ...book }];
      this.store.dispatch(addBook({ book }));
      this.showToast('Book Added', 'success');
    }
    this.tableBooks = [...this.books];

    localStorage.setItem(`books_${this.category}`, JSON.stringify(this.books));
    this.cd.detectChanges();
    this.updateTable();
    this.calculateBorrowedAndAvailableTrends([this.category]);

    this.displayDialog = false;
    this.editDialog = false;
    console.log(this.books.length);
    this.bookService.updateTotalBooks(this.books.length);
  }

  updateTable() {
    // Create a shallow copy of the books array to trigger change detection
    this.books = [...this.books];
    this.cd.detectChanges();
  }

  borrowedBooksByCategory: { [key: string]: number } = {};

  loadCategoriesAndCalculateBorrowedTrends() {
    this.http.get<{ categories: string[] }>('assets/categories.json').subscribe(
      (data) => {
        const categories = data.categories;
        this.calculateBorrowedAndAvailableTrends(categories);
      },
      (error) => {
        console.error('Error loading categories:', error);
      }
    );
  }

  calculateBorrowedAndAvailableTrends(categories: string[]) {
    const borrowedTrends: { [key: string]: number } = JSON.parse(
      localStorage.getItem('borrowed_trends') || '{}'
    );
    const availableTrends: { [key: string]: number } = JSON.parse(
      localStorage.getItem('available_trends') || '{}'
    );

    categories.forEach((category: string) => {
      const storageKey = `books_${category}`;
      const books = JSON.parse(localStorage.getItem(storageKey) || '[]');

      const borrowedCount = books.filter(
        (b: BookDoc) => b.inventoryStatus === 'Checked Out'
      ).length;
      const availableCount = books.length - borrowedCount;

      borrowedTrends[category] = borrowedCount;
      availableTrends[category] = availableCount;
    });
    this.chartDataService.updateChartData(borrowedTrends, availableTrends);
    this.borrowedBooksByCategory = borrowedTrends;

    // Store the data separately in localStorage
    localStorage.setItem('borrowed_trends', JSON.stringify(borrowedTrends));
    localStorage.setItem('available_trends', JSON.stringify(availableTrends));
    
  }

  toggleSelectAll() {
    this.tableBooks = this.tableBooks.map((book) => {
      const updatedBook = { ...book, selected: this.selectAll };
      if (this.selectAll && !this.selectedBooks.includes(book)) {
        this.selectedBooks.push(updatedBook);
      }
      return updatedBook;
    });

    if (!this.selectAll) {
      this.selectedBooks = [];
    }
  }

  onBookSelectionChange(book: BookDoc) {
    // Create a new object to avoid mutating the original book
    const updatedBook = { ...book, selected: !book.selected };

    // Update the tableBooks array with the updated book
    this.tableBooks = this.tableBooks.map((b) =>
      b.author_key === book.author_key ? updatedBook : b
    );

    // Update the selectedBooks array
    if (updatedBook.selected) {
      this.selectedBooks = [...this.selectedBooks, updatedBook];
    } else {
      this.selectedBooks = this.selectedBooks.filter(
        (selectedBook) => selectedBook.author_key !== book.author_key
      );
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Checked Out':
        return 'warning';
      default:
        return 'medium';
    }
  }
  sortOrder: 'asc' | 'desc' = 'asc';

  sortByStatus() {
    this.tableBooks.sort((a, b) => {
      const statusA = (a.inventoryStatus ?? '').toLowerCase();
      const statusB = (b.inventoryStatus ?? '').toLowerCase();

      if (this.sortOrder === 'asc') {
        return statusA.localeCompare(statusB);
      } else {
        return statusB.localeCompare(statusA);
      }
    });

    // Toggle sort order for next click
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  }
}
