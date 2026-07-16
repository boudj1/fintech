export interface Account {
  id: number;
  accountNumber: string;
  ownerId: number;
  type: AccountType;
  balance: number;
  currency: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'BUSINESS' | 'INVESTMENT';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'CLOSED' | 'FROZEN';

export interface CreateAccountRequest {
  ownerId: number;
  type: AccountType;
  currency: string;
}

export interface AccountStats {
  total: number;
  active: number;
  suspended: number;
  totalBalance: number;
}
