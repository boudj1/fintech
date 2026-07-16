import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PageResponse } from '../../../core/services/api.service';
import { Account, AccountStats, CreateAccountRequest } from '../models/account.model';
import { CreateTransactionRequest, Transaction, TransactionStats } from '../models/transaction.model';
import { TopUpRequest, Wallet } from '../models/wallet.model';
import {
  Beneficiary, CreateBeneficiaryRequest, UpdateBeneficiaryRequest
} from '../models/beneficiary.model';
import {
  Product, ProductSubscription, SubscribeRequest,
  CreateProductRequest, UpdateProductRequest
} from '../models/product.model';

@Injectable()
export class FintechService {
  private readonly accountsPath = '/v1/fintech/accounts';
  private readonly transactionsPath = '/v1/fintech/transactions';
  private readonly walletsPath = '/v1/fintech/wallets';
  private readonly beneficiariesPath = '/v1/fintech/beneficiaries';
  private readonly productsPath = '/v1/fintech/products';
  private readonly adminProductsPath = '/v1/admin/products';

  constructor(private api: ApiService) {}

  // ── Accounts ──────────────────────────────────────────────────────────────

  getAccounts(page = 0, size = 20): Observable<PageResponse<Account>> {
    return this.api.get<PageResponse<Account>>(this.accountsPath, { page, size });
  }

  getAccountById(id: number): Observable<Account> {
    return this.api.get<Account>(`${this.accountsPath}/${id}`);
  }

  createAccount(request: CreateAccountRequest): Observable<Account> {
    return this.api.post<Account>(this.accountsPath, request);
  }

  getAccountStats(): Observable<AccountStats> {
    return this.api.get<AccountStats>(`${this.accountsPath}/stats`);
  }

  // ── Transactions ──────────────────────────────────────────────────────────

  getTransactions(page = 0, size = 20): Observable<PageResponse<Transaction>> {
    return this.api.get<PageResponse<Transaction>>(this.transactionsPath, { page, size });
  }

  getTransactionsByOwner(ownerId: number, page = 0, size = 20): Observable<PageResponse<Transaction>> {
    return this.api.get<PageResponse<Transaction>>(`${this.transactionsPath}/owner/${ownerId}`, { page, size });
  }

  createTransaction(request: CreateTransactionRequest): Observable<Transaction> {
    return this.api.post<Transaction>(this.transactionsPath, request);
  }

  getTransactionStats(): Observable<TransactionStats> {
    return this.api.get<TransactionStats>(`${this.transactionsPath}/stats`);
  }

  // ── Wallets ───────────────────────────────────────────────────────────────

  getWalletById(id: number): Observable<Wallet> {
    return this.api.get<Wallet>(`${this.walletsPath}/${id}`);
  }

  getWalletByOwner(ownerId: number): Observable<Wallet> {
    return this.api.get<Wallet>(`${this.walletsPath}/owner/${ownerId}`);
  }

  topUpWallet(id: number, request: TopUpRequest): Observable<Wallet> {
    return this.api.post<Wallet>(`${this.walletsPath}/${id}/top-up`, request);
  }

  // ── Beneficiaries ─────────────────────────────────────────────────────────

  getBeneficiaries(ownerId: number): Observable<Beneficiary[]> {
    return this.api.get<Beneficiary[]>(`${this.beneficiariesPath}/owner/${ownerId}`);
  }

  getActiveBeneficiaries(ownerId: number): Observable<Beneficiary[]> {
    return this.api.get<Beneficiary[]>(`${this.beneficiariesPath}/owner/${ownerId}/active`);
  }

  addBeneficiary(ownerId: number, request: CreateBeneficiaryRequest): Observable<Beneficiary> {
    return this.api.post<Beneficiary>(`${this.beneficiariesPath}/owner/${ownerId}`, request);
  }

  updateBeneficiary(id: number, ownerId: number, request: UpdateBeneficiaryRequest): Observable<Beneficiary> {
    return this.api.put<Beneficiary>(`${this.beneficiariesPath}/${id}/owner/${ownerId}`, request);
  }

  deleteBeneficiary(id: number, ownerId: number): Observable<void> {
    return this.api.delete<void>(`${this.beneficiariesPath}/${id}/owner/${ownerId}`);
  }

  // ── Products ──────────────────────────────────────────────────────────────

  getProductCatalog(): Observable<Product[]> {
    return this.api.get<Product[]>(this.productsPath);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.api.get<Product[]>(`${this.productsPath}/category/${category}`);
  }

  getUserSubscriptions(userId: number): Observable<ProductSubscription[]> {
    return this.api.get<ProductSubscription[]>(`${this.productsPath}/subscriptions/${userId}`);
  }

  subscribeToProduct(userId: number, request: SubscribeRequest): Observable<ProductSubscription> {
    return this.api.post<ProductSubscription>(`${this.productsPath}/subscriptions/${userId}`, request);
  }

  unsubscribeFromProduct(userId: number, productId: number): Observable<void> {
    return this.api.delete<void>(`${this.productsPath}/subscriptions/${userId}/${productId}`);
  }

  // ── Admin — Product Management ────────────────────────────────────────────

  adminGetProducts(): Observable<Product[]> {
    return this.api.get<Product[]>(this.adminProductsPath);
  }

  adminCreateProduct(request: CreateProductRequest): Observable<Product> {
    return this.api.post<Product>(this.adminProductsPath, request);
  }

  adminUpdateProduct(id: number, request: UpdateProductRequest): Observable<Product> {
    return this.api.put<Product>(`${this.adminProductsPath}/${id}`, request);
  }

  adminDeactivateProduct(id: number): Observable<void> {
    return this.api.delete<void>(`${this.adminProductsPath}/${id}`);
  }
}
