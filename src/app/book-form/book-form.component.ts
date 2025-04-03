import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BookService } from '../services/book.service';
// import { loadBooks } from '../state/book.actions';
import { Store } from '@ngrx/store';
import { BookDoc } from '../models/book.model';
import { AppState } from '../states/book.reducer';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-book-form',
  imports: [
    IonHeader,
    IonLabel,
    IonModal,
    FormsModule,
    ReactiveFormsModule,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
  ],
  templateUrl: './book-form.component.html',
  styleUrl: './book-form.component.scss',
})
export class BookFormComponent implements OnInit {
  @Input() displayDialog: boolean = true;
  @Input() book: BookDoc | null = null;
  @Output() save = new EventEmitter<BookDoc>();
  @Output() cancel = new EventEmitter<void>();
  @Input() editDialog: boolean = false;
  visible: boolean = false;

  checkDialogVisibility(): void {
    if (this.displayDialog || this.editDialog) {
      this.visible = true;
    }
  }

  bookForm!: FormGroup;
  authorKey: string | null = null;
  category: string | null = null;

  inventoryOptions = [
    { label: 'Available', value: 'Available' },
    { label: 'Checked Out', value: 'Checked Out' },
  ];

  submitted: boolean = false;

  // book = { title: '', author: '', category: '' };
  bookId: number = 0;

  constructor(
    // private route: ActivatedRoute,
    // private router: Router,
    private fb: FormBuilder,
    private bookService: BookService,
    private store: Store<AppState>
  ) {
    this.bookForm = this.fb.group({
      title: [this.book?.title || '', Validators.required],
      // subtitle:['',Validators.required],
      author_name: [this.book?.author_name || '', Validators.required],
      first_publish_year: [
        this.book?.first_publish_year || '',
        Validators.required,
      ],
      author_key: [this.book?.author_key || '', Validators.required],
      inventoryStatus: [this.book?.inventoryStatus || 'Available'],
      subtitle: [this.book?.subtitle || ''],
    });
  }

  ngOnInit() {
    this.checkDialogVisibility();

    this.bookForm.get('title')?.valueChanges.subscribe((value) => {
      if (typeof value === 'string' && value.startsWith(' ')) {
        this.bookForm
          .get('title')
          ?.setValue(value.trimStart(), { emitEvent: false });
      }
    });

    // Prevent leading spaces in the 'author_name' field
    this.bookForm.get('author_name')?.valueChanges.subscribe((value) => {
      if (typeof value === 'string' && value.startsWith(' ')) {
        this.bookForm
          .get('author_name')
          ?.setValue(value.trimStart(), { emitEvent: false });
      }
    });

    // Prevent leading spaces in the 'author_key' field
    this.bookForm.get('author_key')?.valueChanges.subscribe((value) => {
      if (typeof value === 'string' && value.startsWith(' ')) {
        this.bookForm
          .get('author_key')
          ?.setValue(value.trimStart(), { emitEvent: false });
      }
    });
    if (this.bookId) {
      if (this.book) {
        this.bookForm.patchValue(this.book);
      }
    }
  }

  ngOnChanges() {
    this.checkDialogVisibility();

    if (this.book) {
      this.bookForm.patchValue({
        ...this.book,
        author_name: Array.isArray(this.book.author_name)
          ? this.book.author_name[0]
          : this.book.author_name,
        author_key: Array.isArray(this.book.author_key)
          ? this.book.author_key[0]
          : this.book.author_key,
      });
    } else {
      this.bookForm.reset({
        title: '',
        subtitle: '',
        author_name: '',
        first_publish_year: '',
        author_key: '',
        inventoryStatus: 'Available',
      });
    }
  }

  onSave(): void {
    if (this.bookForm.valid) {
      const book = this.bookForm.value;

      book.title =
        typeof book.title === 'string' ? book.title.trim() : book.title;
      book.author_name =
        typeof book.author_name === 'string'
          ? book.author_name.trim()
          : book.author_name;
      book.author_key =
        typeof book.author_key === 'string'
          ? book.author_key.trim()
          : book.author_key;

      book.category = this.category;

      book.author_key = Array.isArray(book.author_key)
        ? book.author_key
        : [book.author_key];

      book.author_name = Array.isArray(book.author_name)
        ? book.author_name
        : [book.author_name];

      if (
        typeof book.inventoryStatus === 'object' &&
        book.inventoryStatus.value
      ) {
        book.inventoryStatus = book.inventoryStatus.value;
      }

      this.save.emit(book);
      this.displayDialog = false;
      this.editDialog = false;
      this.visible = false;
    }
  }

  markTouched(field: string) {
    const control = this.bookForm.get(field);
    if (control) {
      if (typeof control.value === 'string') {
        control.setValue(control.value.trim());
      }
      control.markAsTouched();
      control.markAsDirty();
    }
  }

  onCancel() {
    this.visible = false;
    this.displayDialog = false;
    this.editDialog = false;
    this.submitted = false;
    this.cancel.emit();
    // this.router.navigate(['/book-list', { category: this.category }]);
  }
}
