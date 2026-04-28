export interface LoanRequest {
    bookTitle: string;
    bookAuthor: string;
    category: string;
    requestedStartDate: string;
    requestedEndDate: string;
}

export interface LoanRecord extends LoanRequest {
    loanId: string;
    createdAt: string;
    rank: number;
    effectiveStartDate: string;
    effectiveEndDate: string;
    shifted: boolean;
    dueDate: string;
}