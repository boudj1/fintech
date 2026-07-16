import { Component, OnInit } from '@angular/core';
import { FintechService } from '../../services/fintech.service';
import { Product, ProductSubscription } from '../../models/product.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-products',
  template: `
    <div class="products-container">
      <div class="page-header">
        <div>
          <h2>Produits FinFlow</h2>
          <p class="subtitle">Découvrez nos services financiers et gérez vos abonnements</p>
        </div>
      </div>

      <div class="tabs">
        <button [class.active]="activeTab === 'catalog'" (click)="activeTab = 'catalog'">Catalogue</button>
        <button [class.active]="activeTab === 'mine'" (click)="activeTab = 'mine'">Mes produits</button>
      </div>

      <!-- CATALOG TAB -->
      <div *ngIf="activeTab === 'catalog'">
        <div class="category-filter">
          <button *ngFor="let cat of categories" [class.active]="selectedCategory === cat"
                  (click)="filterByCategory(cat)">{{ cat }}</button>
        </div>
        <div class="products-grid">
          <div class="product-card card" *ngFor="let p of filteredProducts">
            <div class="product-icon">{{ getCategoryIcon(p.category) }}</div>
            <div class="product-header">
              <h3>{{ p.name }}</h3>
              <span class="price" *ngIf="p.monthlyFee > 0">{{ p.monthlyFee | number:'1.0-0' }} DZD/mois</span>
              <span class="price free" *ngIf="p.monthlyFee === 0">Gratuit</span>
            </div>
            <p class="product-desc">{{ p.description }}</p>
            <ul class="features">
              <li *ngFor="let f of p.features">✓ {{ f }}</li>
            </ul>
            <button class="btn btn-primary" (click)="subscribe(p)"
                    [disabled]="isSubscribed(p.id)">
              {{ isSubscribed(p.id) ? '✓ Activé' : 'Activer' }}
            </button>
          </div>
        </div>
      </div>

      <!-- MY PRODUCTS TAB -->
      <div *ngIf="activeTab === 'mine'">
        <div *ngIf="subscriptions.length === 0" class="empty-state">
          <p>Vous n'avez souscrit à aucun produit. Consultez notre catalogue pour commencer.</p>
          <button class="btn btn-primary" (click)="activeTab = 'catalog'">Voir le catalogue</button>
        </div>
        <div class="my-products-list">
          <div class="my-product-card card" *ngFor="let s of subscriptions">
            <div class="product-icon">{{ getCategoryIcon(s.product.category) }}</div>
            <div class="product-info">
              <h3>{{ s.product.name }}</h3>
              <span class="status-badge" [class.active-badge]="s.status === 'ACTIVE'">{{ s.status }}</span>
              <p class="sub-date">Depuis le {{ s.subscribedAt | date:'dd/MM/yyyy' }}</p>
            </div>
            <button class="btn btn-danger btn-sm" (click)="unsubscribe(s)">Désactiver</button>
          </div>
        </div>
      </div>

      <div class="error-msg" *ngIf="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .products-container { padding: 24px; }
    .page-header { margin-bottom: 20px; }
    .subtitle { color: #666; margin: 4px 0 0; }
    .tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 2px solid #eee; }
    .tabs button { padding: 10px 20px; border: none; background: none; cursor: pointer; font-weight: 600; color: #999; border-bottom: 2px solid transparent; margin-bottom: -2px; }
    .tabs button.active { color: #3498db; border-bottom-color: #3498db; }
    .category-filter { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .category-filter button { padding: 6px 16px; border-radius: 20px; border: 1px solid #ddd; background: #fff; cursor: pointer; font-size: 13px; }
    .category-filter button.active { background: #3498db; color: #fff; border-color: #3498db; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .product-card { display: flex; flex-direction: column; gap: 12px; }
    .product-icon { font-size: 32px; }
    .product-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .product-header h3 { margin: 0; font-size: 16px; }
    .price { font-weight: 700; color: #e74c3c; font-size: 14px; }
    .price.free { color: #27ae60; }
    .product-desc { color: #666; font-size: 13px; margin: 0; }
    .features { margin: 0; padding: 0 0 0 16px; font-size: 13px; color: #444; }
    .features li { margin: 4px 0; }
    .btn { padding: 8px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; }
    .btn-primary { background: #3498db; color: #fff; }
    .btn-primary:disabled { background: #27ae60; cursor: default; }
    .btn-danger { background: #e74c3c; color: #fff; }
    .btn-sm { padding: 4px 12px; font-size: 12px; }
    .my-product-card { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
    .product-info { flex: 1; }
    .product-info h3 { margin: 0 0 4px; }
    .status-badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px; background: #eee; color: #999; }
    .active-badge { background: #d5f5e3; color: #27ae60; }
    .sub-date { margin: 4px 0 0; font-size: 12px; color: #999; }
    .empty-state { text-align: center; padding: 48px; color: #999; }
    .error-msg { color: #e74c3c; margin-top: 12px; }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  subscriptions: ProductSubscription[] = [];
  activeTab = 'catalog';
  selectedCategory = 'TOUS';
  categories = ['TOUS', 'ACCOUNT', 'SAVINGS', 'CARD', 'TRANSFER', 'BUSINESS'];
  error = '';

  constructor(
    private fintechService: FintechService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fintechService.getProductCatalog().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
      }
    });
    const userId = this.authService.currentUser?.id;
    if (userId) {
      this.fintechService.getUserSubscriptions(userId).subscribe({
        next: (data) => { this.subscriptions = data; }
      });
    }
  }

  filterByCategory(cat: string): void {
    this.selectedCategory = cat;
    this.filteredProducts = cat === 'TOUS' ? this.products : this.products.filter(p => p.category === cat);
  }

  isSubscribed(productId: number): boolean {
    return this.subscriptions.some(s => s.product.id === productId && s.status === 'ACTIVE');
  }

  subscribe(product: Product): void {
    const userId = this.authService.currentUser?.id;
    if (!userId) return;
    this.fintechService.subscribeToProduct(userId, { productId: product.id }).subscribe({
      next: (sub) => { this.subscriptions.push(sub); },
      error: (err) => { this.error = err?.error?.message || 'Erreur lors de l\'activation.'; }
    });
  }

  unsubscribe(sub: ProductSubscription): void {
    const userId = this.authService.currentUser?.id;
    if (!userId || !confirm(`Désactiver ${sub.product.name} ?`)) return;
    this.fintechService.unsubscribeFromProduct(userId, sub.product.id).subscribe({
      next: () => {
        this.subscriptions = this.subscriptions.filter(s => s.id !== sub.id);
      }
    });
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      ACCOUNT: '🏦', SAVINGS: '💰', CARD: '💳', TRANSFER: '🌍', BUSINESS: '🏢'
    };
    return icons[category] ?? '📦';
  }
}
