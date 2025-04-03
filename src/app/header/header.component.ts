import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookService } from '../services/book.service';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';
import { MenuItem } from '../models/menu-item.model';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  items: MenuItem[] = [];
  categories: Category[] = [];
  searchText: string = '';
  @Input() totalBooks: number = 0;
  menuItems: MenuItem[] = [{ label: 'Dashboard', icon: 'pi pi-home' }];

  constructor(
    public bookService: BookService,
    private router: Router,
    private categoryService: CategoryService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Fetch book categories dynamically
    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = [...new Set(categories)];

        // Unique categories

        // Define menu items
        this.items = [
          {
            label: 'Home',
            icon: 'pi pi-home',
            command: () => this.router.navigate(['/books']),
          },
          {
            label: 'Categories',
            icon: 'pi pi-list',
            items: this.categories.map((category) => ({
              label: category,
              command: () => this.filterByCategory(category),
            })),
          },
        ];
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.categories = []; // ✅ Prevents undefined errors
      },
    });
    this.bookService.totalBooks$.subscribe((count) => {
      console.log('Updated totalBooks in header:', count);
      setTimeout(() => {
        this.totalBooks = count;
      });
      this.cd.detectChanges();
    });
  }

  // Function to filter books based on category
  filterByCategory(category: string) {
    this.router.navigate(['/books'], { queryParams: { category } });
  }

  // Function to search books
  searchBooks() {
    if (this.searchText.trim() !== '') {
      this.router.navigate(['/books'], {
        queryParams: { search: this.searchText },
      });
    }
  }
}
