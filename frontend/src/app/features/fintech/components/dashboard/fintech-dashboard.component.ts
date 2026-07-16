import { Component, OnInit } from '@angular/core';
import { FintechService } from '../../services/fintech.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Account } from '../../models/account.model';
import { Transaction } from '../../models/transaction.model';
import { Wallet } from '../../models/wallet.model';

@Component({
  selector: 'app-fintech-dashboard',
  template: `
    <div class="dashboard">

      <!-- Welcome banner -->
      <div class="welcome-banner">
        <div class="welcome-text">
          <h1>Bonjour, {{ firstName }} 👋</h1>
          <p>Voici un résumé de vos finances FinFlow</p>
        </div>
        <div class="wallet-balance" *ngIf="wallet">
          <span class="balance-label">Portefeuille</span>
          <span class="balance-amount">{{ wallet.balance | number:'1.2-2' }} <span class="currency">{{ wallet.currency }}</span></span>
        </div>
      </div>

      <!-- Quick stats -->
      <div class="stats-row">
        <div class="stat-card blue">
          <div class="stat-icon">🏦</div>
          <div class="stat-body">
            <div class="stat-value">{{ accounts.length }}</div>
            <div class="stat-label">Comptes actifs</div>
          </div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon">💸</div>
          <div class="stat-body">
            <div class="stat-value">{{ totalBalance | number:'1.0-0' }} DZD</div>
            <div class="stat-label">Solde total</div>
          </div>
        </div>
        <div class="stat-card purple">
          <div class="stat-icon">📋</div>
          <div class="stat-body">
            <div class="stat-value">{{ recentTransactions.length }}</div>
            <div class="stat-label">Transactions récentes</div>
          </div>
        </div>
        <div class="stat-card orange">
          <div class="stat-icon">👥</div>
          <div class="stat-body">
            <div class="stat-value">Bénéficiaires</div>
            <div class="stat-label">Gérer mes virements</div>
          </div>
        </div>
      </div>

      <!-- Accounts + Recent transactions -->
      <div class="main-grid">
        <div class="card accounts-card">
          <div class="card-header">
            <h3>Mes comptes</h3>
            <a routerLink="/fintech/accounts" class="see-all">Voir tout →</a>
          </div>
          <div *ngIf="accounts.length === 0" class="empty">Aucun compte trouvé.</div>
          <div class="account-item" *ngFor="let a of accounts">
            <div class="account-icon">{{ a.type === 'SAVINGS' ? '💰' : '🏦' }}</div>
            <div class="account-info">
              <div class="account-type">{{ a.type }}</div>
              <div class="account-number">{{ a.accountNumber }}</div>
            </div>
            <div class="account-balance">
              {{ a.balance | number:'1.2-2' }} <span class="cur">{{ a.currency }}</span>
            </div>
          </div>
        </div>

        <div class="card transactions-card">
          <div class="card-header">
            <h3>Dernières transactions</h3>
            <a routerLink="/fintech/transactions" class="see-all">Voir tout →</a>
          </div>
          <div *ngIf="recentTransactions.length === 0" class="empty">Aucune transaction.</div>
          <div class="tx-item" *ngFor="let t of recentTransactions">
            <div class="tx-icon">{{ getTxIcon(t.type) }}</div>
            <div class="tx-info">
              <div class="tx-type">{{ t.type }}</div>
              <div class="tx-desc">{{ t.description || t.referenceNumber }}</div>
            </div>
            <div class="tx-amount" [class.credit]="t.type === 'DEPOSIT'" [class.debit]="t.type !== 'DEPOSIT'">
              {{ t.type === 'DEPOSIT' ? '+' : '-' }}{{ t.amount | number:'1.2-2' }} {{ t.currency }}
            </div>
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="card quick-actions">
        <h3>Actions rapides</h3>
        <div class="actions-grid">
          <a routerLink="/fintech/beneficiaries" class="action-btn">
            <span class="action-icon">👤</span>
            <span>Bénéficiaires</span>
          </a>
          <a routerLink="/fintech/wallet" class="action-btn">
            <span class="action-icon">👜</span>
            <span>Recharger</span>
          </a>
          <a routerLink="/fintech/products" class="action-btn">
            <span class="action-icon">📦</span>
            <span>Produits</span>
          </a>
          <a routerLink="/chatbot" class="action-btn">
            <span class="action-icon">🤖</span>
            <span>Assistant IA</span>
          </a>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard { padding: 24px; max-width: 1200px; }
    .welcome-banner {
      display: flex; justify-content: space-between; align-items: center;
      background: linear-gradient(135deg, #0d1b3e, #1d4ed8);
      color: #fff; border-radius: 16px; padding: 28px 32px; margin-bottom: 24px;
    }
    .welcome-banner h1 { margin: 0; font-size: 24px; }
    .welcome-banner p { margin: 6px 0 0; opacity: .8; font-size: 14px; }
    .wallet-balance { text-align: right; }
    .balance-label { display: block; font-size: 12px; opacity: .7; margin-bottom: 4px; }
    .balance-amount { font-size: 28px; font-weight: 800; }
    .currency { font-size: 14px; font-weight: 400; }

    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card {
      display: flex; align-items: center; gap: 16px;
      background: #fff; border-radius: 12px; padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,.06);
    }
    .stat-icon { font-size: 28px; }
    .stat-value { font-size: 20px; font-weight: 700; }
    .stat-label { font-size: 12px; color: #888; margin-top: 2px; }
    .blue .stat-value { color: #1d4ed8; }
    .green .stat-value { color: #059669; }
    .purple .stat-value { color: #7c3aed; }
    .orange .stat-value { color: #d97706; }

    .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .card {
      background: #fff; border-radius: 12px; padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,.06);
    }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .card-header h3 { margin: 0; font-size: 16px; font-weight: 700; color: #1a1a2e; }
    .see-all { font-size: 13px; color: #1d4ed8; text-decoration: none; font-weight: 600; }
    .see-all:hover { text-decoration: underline; }
    .empty { color: #999; font-size: 14px; padding: 16px 0; text-align: center; }

    .account-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .account-item:last-child { border-bottom: none; }
    .account-icon { font-size: 22px; }
    .account-info { flex: 1; }
    .account-type { font-weight: 600; font-size: 14px; }
    .account-number { font-size: 12px; color: #888; font-family: monospace; }
    .account-balance { font-weight: 700; font-size: 15px; color: #059669; }
    .cur { font-size: 11px; font-weight: 400; color: #888; }

    .tx-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .tx-item:last-child { border-bottom: none; }
    .tx-icon { font-size: 20px; width: 32px; text-align: center; }
    .tx-info { flex: 1; min-width: 0; }
    .tx-type { font-weight: 600; font-size: 13px; }
    .tx-desc { font-size: 11px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tx-amount { font-weight: 700; font-size: 14px; white-space: nowrap; }
    .credit { color: #059669; }
    .debit { color: #dc2626; }

    .quick-actions { }
    .quick-actions h3 { margin: 0 0 16px; font-size: 16px; font-weight: 700; }
    .actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .action-btn {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 20px 12px; border-radius: 10px; background: #f8faff;
      border: 1.5px solid #e0eaff; text-decoration: none; color: #1a1a2e;
      font-size: 13px; font-weight: 600; transition: all .15s;
    }
    .action-btn:hover { background: #eff4ff; border-color: #1d4ed8; color: #1d4ed8; }
    .action-icon { font-size: 26px; }
  `]
})
export class FintechDashboardComponent implements OnInit {
  accounts: Account[] = [];
  recentTransactions: Transaction[] = [];
  wallet: Wallet | null = null;

  constructor(
    private fintechService: FintechService,
    private authService: AuthService
  ) {}

  get firstName(): string {
    return this.authService.currentUser()?.firstName ?? 'Utilisateur';
  }

  get totalBalance(): number {
    return this.accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  }

  ngOnInit(): void {
    const userId = this.authService.currentUser()?.id;

    this.fintechService.getAccounts(0, 10).subscribe({
      next: (res) => { this.accounts = res.content ?? []; }
    });

    if (userId) {
      this.fintechService.getTransactionsByOwner(userId, 0, 5).subscribe({
        next: (res) => { this.recentTransactions = res.content ?? []; }
      });

      this.fintechService.getWalletByOwner(userId).subscribe({
        next: (w) => { this.wallet = w; },
        error: () => {}
      });
    }
  }

  getTxIcon(type: string): string {
    const icons: Record<string, string> = {
      TRANSFER: '↗️', DEPOSIT: '↙️', WITHDRAWAL: '🏧', PAYMENT: '💳', REFUND: '↩️'
    };
    return icons[type] ?? '💸';
  }
}
