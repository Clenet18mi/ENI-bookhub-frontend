export interface Loan {
    id: number;
    bookId: number;
    bookTitle: string;
    bookAuthor: string;
    bookCategory: string | null;
    bookCoverUrl: string | null;
    loanDate: string;   // ISO date  (yyyy-MM-dd)
    dueDate: string;    // ISO date
    returnDate: string | null;
    status: 'ACTIVE' | 'OVERDUE' | 'RETURNED' | 'PENDING';
}