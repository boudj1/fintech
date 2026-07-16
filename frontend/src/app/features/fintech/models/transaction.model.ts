export interface Transaction {
  id: number;
  referenceNumber: string;
  sourceAccountId?: number;
  destinationAccountId?: number;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  fee: number;
  processedAt?: string;
  createdAt: string;
}

export type TransactionType = 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND';
export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVERSED' | 'CANCELLED';

export interface CreateTransactionRequest {
  sourceAccountId?: number;
  destinationAccountId?: number;
  amount: number;
  type: TransactionType;
  currency?: string;
  description?: string;
}

export interface TransactionStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  totalVolume: number;
}
