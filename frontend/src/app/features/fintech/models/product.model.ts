export type ProductCategory = 'ACCOUNT' | 'SAVINGS' | 'CARD' | 'TRANSFER' | 'BUSINESS';

export interface Product {
  id: number;
  code: string;
  name: string;
  description?: string;
  category: ProductCategory;
  monthlyFee: number;
  features: string[];
  active: boolean;
  createdAt: string;
}

export interface ProductSubscription {
  id: number;
  userId: number;
  product: Product;
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  subscribedAt: string;
  expiresAt?: string;
}

export interface SubscribeRequest {
  productId: number;
}

export interface CreateProductRequest {
  code: string;
  name: string;
  description?: string;
  category: ProductCategory;
  monthlyFee?: number;
  features?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  monthlyFee?: number;
  features?: string;
  active?: boolean;
}
