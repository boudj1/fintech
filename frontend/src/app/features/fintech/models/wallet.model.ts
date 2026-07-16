export interface Wallet {
  id: number;
  ownerId: number;
  balance: number;
  currency: string;
  status: WalletStatus;
  dailyLimit: number;
  createdAt: string;
  updatedAt: string;
}

export type WalletStatus = 'ACTIVE' | 'SUSPENDED' | 'CLOSED';

export interface TopUpRequest {
  amount: number;
  description?: string;
}
