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

export interface Review {
  id: number;
  comment: string;
  rating: number;
  userName: string;
  createdAt: string;
}


export interface BookDetail extends Book {
  description: string;
  averageRating: number;
  isAvailable: boolean;
  reviews: Review[];
}
