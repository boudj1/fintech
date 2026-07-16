import { Component, OnInit } from '@angular/core';
import { FintechService } from '../../../fintech/services/fintech.service';
import { Product, CreateProductRequest, UpdateProductRequest } from '../../../fintech/models/product.model';

@Component({
  selector: 'app-products-management',
  template: `
    <div class="pm-container">
      <div class="page-header">
        <h2>Gestion des Produits FinFlow</h2>
        <button class="btn btn-primary" (click)="showCreateForm = !showCreateForm">
          + Nouveau produit
        </button>
      </div>

      <!-- Create Form -->
      <div class="form-card card" *ngIf="showCreateForm">
        <h3>Créer un nouveau produit</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Code *</label>
            <input [(ngModel)]="newProduct.code" placeholder="CARTE_DEBIT" class="form-control" />
          </div>
          <div class="form-group">
            <label>Nom *</label>
            <input [(ngModel)]="newProduct.name" placeholder="Carte Débit FinFlow" class="form-control" />
          </div>
          <div class="form-group">
            <label>Catégorie *</label>
            <select [(ngModel)]="newProduct.category" class="form-control">
              <option value="ACCOUNT">ACCOUNT</option>
              <option value="SAVINGS">SAVINGS</option>
              <option value="CARD">CARD</option>
              <option value="TRANSFER">TRANSFER</option>
              <option value="BUSINESS">BUSINESS</option>
            </select>
          </div>
          <div class="form-group">
            <label>Frais mensuels (DZD)</label>
            <input [(ngModel)]="newProduct.monthlyFee" type="number" placeholder="0" class="form-control" />
          </div>
          <div class="form-group full">
            <label>Description</label>
            <input [(ngModel)]="newProduct.description" placeholder="Description du produit" class="form-control" />
          </div>
          <div class="form-group full">
            <label>Fonctionnalités (séparées par virgule)</label>
            <input [(ngModel)]="newProduct.features" placeholder="IBAN DZ,Virements illimités,Carte virtuelle" class="form-control" />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-success" (click)="createProduct()">Créer</button>
          <button class="btn btn-secondary" (click)="showCreateForm = false">Annuler</button>
        </div>
        <div class="error-msg" *ngIf="error">{{ error }}</div>
      </div>

      <!-- Products Table -->
      <div class="card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Frais / mois</th>
              <th>Fonctionnalités</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of products">
              <td><code>{{ p.code }}</code></td>
              <td><strong>{{ p.name }}</strong></td>
              <td><span class="category-badge cat-{{ p.category.toLowerCase() }}">{{ p.category }}</span></td>
              <td>{{ p.monthlyFee === 0 ? 'Gratuit' : (p.monthlyFee | number:'1.0-0') + ' DZD' }}</td>
              <td>
                <div class="features-list">
                  <span class="feature-tag" *ngFor="let f of p.features">{{ f }}</span>
                </div>
              </td>
              <td>
                <span class="status-badge" [class.active-status]="p.active">
                  {{ p.active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-warning" (click)="toggleActive(p)">
                  {{ p.active ? 'Désactiver' : 'Activer' }}
                </button>
              </td>
            </tr>
            <tr *ngIf="products.length === 0">
              <td colspan="7" style="text-align:center;padding:24px;color:#999">
                Aucun produit trouvé.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .pm-container { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,.08); margin-bottom: 20px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; }
    .form-group.full { grid-column: 1 / -1; }
    .form-group label { font-weight: 600; font-size: 13px; color: #555; }
    .form-control { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
    .form-actions { display: flex; gap: 8px; margin-top: 16px; }
    .btn { padding: 8px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; }
    .btn-primary { background: #3498db; color: #fff; }
    .btn-success { background: #27ae60; color: #fff; }
    .btn-secondary { background: #95a5a6; color: #fff; }
    .btn-warning { background: #f39c12; color: #fff; }
    .btn-sm { padding: 4px 12px; font-size: 12px; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .data-table th { padding: 12px 16px; text-align: left; background: #f8f9fa; font-weight: 700; color: #555; border-bottom: 2px solid #eee; }
    .data-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .category-badge { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }
    .cat-account { background: #d6eaf8; color: #2980b9; }
    .cat-savings { background: #d5f5e3; color: #27ae60; }
    .cat-card { background: #fdebd0; color: #e67e22; }
    .cat-transfer { background: #e8daef; color: #8e44ad; }
    .cat-business { background: #fdfefe; color: #2c3e50; border: 1px solid #ddd; }
    .status-badge { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; background: #eee; color: #999; }
    .active-status { background: #d5f5e3; color: #27ae60; }
    .features-list { display: flex; flex-wrap: wrap; gap: 4px; }
    .feature-tag { font-size: 10px; background: #eaf2fb; color: #2980b9; padding: 2px 6px; border-radius: 4px; }
    .error-msg { color: #e74c3c; margin-top: 8px; }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
  `]
})
export class ProductsManagementComponent implements OnInit {
  products: Product[] = [];
  showCreateForm = false;
  error = '';
  newProduct: CreateProductRequest = { code: '', name: '', category: 'ACCOUNT', monthlyFee: 0 };

  constructor(private fintechService: FintechService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.fintechService.adminGetProducts().subscribe({
      next: (data) => { this.products = data; }
    });
  }

  createProduct(): void {
    this.error = '';
    if (!this.newProduct.code?.trim() || !this.newProduct.name?.trim()) {
      this.error = 'Code et nom sont obligatoires.';
      return;
    }
    this.fintechService.adminCreateProduct(this.newProduct).subscribe({
      next: (p) => {
        this.products.unshift(p);
        this.newProduct = { code: '', name: '', category: 'ACCOUNT', monthlyFee: 0 };
        this.showCreateForm = false;
      },
      error: (err) => { this.error = err?.error?.message || 'Erreur lors de la création.'; }
    });
  }

  toggleActive(product: Product): void {
    const req: UpdateProductRequest = { active: !product.active };
    this.fintechService.adminUpdateProduct(product.id, req).subscribe({
      next: (updated) => {
        const idx = this.products.findIndex(p => p.id === updated.id);
        if (idx >= 0) this.products[idx] = updated;
      }
    });
  }
}
