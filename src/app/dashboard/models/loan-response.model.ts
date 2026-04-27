export interface LoanResponse {
    id: number;

    // Lecteur
    userEmail: string;
    userFullName: string;

    // Livre
    bookId: number;
    bookTitle: string;
    bookIsbn: string;
    bookAuthor: string;
    bookCategory: string;

    // Dates & Statut
    loanDate: string;
    dueDate: string;
    returnDate: string | null;
    status: 'ACTIVE' | 'OVERDUE' | 'RETURNED' | 'PENDING';
}