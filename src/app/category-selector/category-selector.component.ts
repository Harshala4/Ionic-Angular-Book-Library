import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CategoryService } from '../services/category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Import Router
import {
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonSearchbar,
  IonToolbar,
  IonIcon,
  IonButton,
  IonTitle,
} from '@ionic/angular/standalone';
import { Category } from '../models/category.model';
import { IonSelectCustomEvent } from '@ionic/core'; // Import IonSelectCustomEvent

@Component({
  standalone: true,
  selector: 'app-category-selector',
  imports: [
    IonItem,
    IonList,
    CommonModule,
    FormsModule,
    IonSelect,
    IonSelectOption,
  ],
  templateUrl: './category-selector.component.html',
  styleUrl: './category-selector.component.scss',
})
export class CategorySelectorComponent implements OnInit {
  categories: { label: string; value: string }[] = [];
  selectedCategory: string = '';
  @Output() categoryChange = new EventEmitter<string>();

  constructor(
    private categoryService: CategoryService,
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe((categories: Category[]) => {
      this.categories = categories.map((category) => ({
        label: category,
        value: category,
      }));
    });
  }

  onCategoryChange(event: IonSelectCustomEvent<{ value: string }>) {
    this.selectedCategory = event.detail.value; // Use event.detail.value
    console.log('Selected Category:', this.selectedCategory);
    this.categoryChange.emit(this.selectedCategory);

    // Navigate to a route based on the selected category
    this.router.navigate(['/books', this.selectedCategory]);
  }
}
