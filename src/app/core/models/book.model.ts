export interface Book {
  id?: number;
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  description?: string;
  averageRating?: number;
  totalCopies: number;
  availableCopies?: number;
}
