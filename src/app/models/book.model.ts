export interface BookCategory {
  name: string;
}

export interface CategoryResponse {
  subjects: BookCategory[];
}

export interface BookDoc {
selected: any;
  author_key?: string[];
  author_name?: string[];
  first_publish_year?: number;
  title: string;
  subtitle?: string;
  inventoryStatus?: string; // Add this line
  category?: string;
}

export interface BookApiResponse {
  numFound: number;
  start: number;
  docs: BookDoc[]; // 'docs' is an array of Book
}
