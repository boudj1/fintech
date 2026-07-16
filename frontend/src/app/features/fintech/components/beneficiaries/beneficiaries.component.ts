import { Component, OnInit } from '@angular/core';
import { FintechService } from '../../services/fintech.service';
import { Beneficiary, CreateBeneficiaryRequest } from '../../models/beneficiary.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-beneficiaries',
  template: `
    <div class="beneficiaries-container">
      <div class="page-header">
        <h2>Bénéficiaires</h2>
        <button class="btn btn-primary" (click)="showAddForm = !showAddForm">
          + Ajouter un bénéficiaire
        </button>
      </div>

      <div class="add-form card" *ngIf="showAddForm">
        <h3>Nouveau bénéficiaire</h3>
        <div class="form-group">
          <label>Nom *</label>
          <input [(ngModel)]="newBeneficiary.name" placeholder="Ali Benali" class="form-control" />
        </div>
        <div class="form-group">
          <label>IBAN</label>
          <input [(ngModel)]="newBeneficiary.iban" placeholder="DZ59 0000 ..." class="form-control" />
        </div>
        <div class="form-group">
          <label>Banque</label>
          <input [(ngModel)]="newBeneficiary.bankName" placeholder="CPA, BNA, BDL..." class="form-control" />
        </div>
        <div class="form-group">
          <label>Devise</label>
          <select [(ngModel)]="newBeneficiary.currency" class="form-control">
            <option value="DZD">DZD — Dinar algérien</option>
            <option value="EUR">EUR — Euro</option>
            <option value="USD">USD — Dollar US</option>
          </select>
        </div>
        <div class="form-actions">
          <button class="btn btn-success" (click)="addBeneficiary()">Enregistrer</button>
          <button class="btn btn-secondary" (click)="showAddForm = false">Annuler</button>
        </div>
        <div class="error-msg" *ngIf="error">{{ error }}</div>
      </div>

      <div class="beneficiaries-list">
        <div *ngIf="loading" class="loading">Chargement...</div>
        <div *ngIf="!loading && beneficiaries.length === 0" class="empty-state">
          <p>Aucun bénéficiaire enregistré. Ajoutez des bénéficiaires pour faciliter vos virements.</p>
        </div>
        <div class="beneficiary-card card" *ngFor="let b of beneficiaries">
          <div class="beneficiary-avatar">{{ b.name.charAt(0).toUpperCase() }}</div>
          <div class="beneficiary-info">
            <h4>{{ b.name }}</h4>
            <p *ngIf="b.iban" class="iban">{{ b.iban }}</p>
            <p *ngIf="b.bankName" class="bank">{{ b.bankName }}</p>
            <span class="currency-badge">{{ b.currency }}</span>
          </div>
          <div class="beneficiary-actions">
            <button class="btn btn-sm btn-outline" (click)="transfer(b)">Virer</button>
            <button class="btn btn-sm btn-danger" (click)="deleteBeneficiary(b.id)">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .beneficiaries-container { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,.08); margin-bottom: 16px; }
    .add-form { border-left: 4px solid #3498db; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 4px; color: #555; }
    .form-control { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
    .form-actions { display: flex; gap: 8px; margin-top: 16px; }
    .btn { padding: 8px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; }
    .btn-primary { background: #3498db; color: #fff; }
    .btn-success { background: #27ae60; color: #fff; }
    .btn-secondary { background: #95a5a6; color: #fff; }
    .btn-danger { background: #e74c3c; color: #fff; }
    .btn-outline { background: transparent; border: 1px solid #3498db; color: #3498db; }
    .btn-sm { padding: 4px 12px; font-size: 12px; }
    .beneficiary-card { display: flex; align-items: center; gap: 16px; }
    .beneficiary-avatar { width: 48px; height: 48px; border-radius: 50%; background: #3498db; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; flex-shrink: 0; }
    .beneficiary-info { flex: 1; }
    .beneficiary-info h4 { margin: 0 0 4px; }
    .beneficiary-info p { margin: 2px 0; color: #666; font-size: 13px; }
    .iban { font-family: monospace; }
    .currency-badge { background: #eaf2fb; color: #2980b9; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .beneficiary-actions { display: flex; gap: 8px; }
    .error-msg { color: #e74c3c; margin-top: 8px; }
    .empty-state { text-align: center; padding: 48px; color: #999; }
    .loading { text-align: center; padding: 24px; color: #999; }
  `]
})
export class BeneficiariesComponent implements OnInit {
  beneficiaries: Beneficiary[] = [];
  loading = false;
  error = '';
  showAddForm = false;
  newBeneficiary: CreateBeneficiaryRequest = { name: '', currency: 'DZD' };

  constructor(
    private fintechService: FintechService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBeneficiaries();
  }

  loadBeneficiaries(): void {
    const userId = this.authService.currentUser?.id;
    if (!userId) return;
    this.loading = true;
    this.fintechService.getBeneficiaries(userId).subscribe({
      next: (data) => { this.beneficiaries = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  addBeneficiary(): void {
    this.error = '';
    if (!this.newBeneficiary.name?.trim()) { this.error = 'Le nom est obligatoire.'; return; }
    const userId = this.authService.currentUser?.id;
    if (!userId) return;
    this.fintechService.addBeneficiary(userId, this.newBeneficiary).subscribe({
      next: (b) => {
        this.beneficiaries.unshift(b);
        this.newBeneficiary = { name: '', currency: 'DZD' };
        this.showAddForm = false;
      },
      error: (err) => { this.error = err?.error?.message || 'Erreur lors de l\'ajout.'; }
    });
  }

  deleteBeneficiary(id: number): void {
    const userId = this.authService.currentUser?.id;
    if (!userId || !confirm('Supprimer ce bénéficiaire ?')) return;
    this.fintechService.deleteBeneficiary(id, userId).subscribe({
      next: () => { this.beneficiaries = this.beneficiaries.filter(b => b.id !== id); }
    });
  }

  transfer(b: Beneficiary): void {
    // Navigate to transfer with pre-filled beneficiary (extend later)
    alert(`Virement vers ${b.name} — fonctionnalité disponible dans la section Transactions.`);
  }
}
