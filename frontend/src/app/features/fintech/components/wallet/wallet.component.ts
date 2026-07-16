import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FintechService } from '../../services/fintech.service';
import { Wallet } from '../../models/wallet.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-wallet',
  template: `
    <div class="content-wrapper">
      <h1>My Wallet</h1>
      <div *ngIf="wallet" class="wallet-card">
        <div class="wallet-balance">
          <span class="label">Balance</span>
          <span class="amount">{{ wallet.balance | number:'1.2-2' }} {{ wallet.currency }}</span>
        </div>
        <div class="wallet-info">
          <div><strong>Status:</strong> {{ wallet.status }}</div>
          <div><strong>Daily Limit:</strong> {{ wallet.dailyLimit | number:'1.0-0' }} {{ wallet.currency }}</div>
        </div>
      </div>
      <div *ngIf="!wallet" class="empty-state">No wallet found.</div>
    </div>
  `,
  styles: [`
    .wallet-card { background:linear-gradient(135deg,#1565c0,#1976d2); color:white; padding:32px; border-radius:16px; max-width:400px; }
    .wallet-balance { margin-bottom:24px; }
    .label { display:block; font-size:13px; opacity:.8; }
    .amount { font-size:36px; font-weight:700; }
    .wallet-info { display:flex; flex-direction:column; gap:8px; font-size:14px; }
  `]
})
export class WalletComponent implements OnInit {
  wallet: Wallet | null = null;

  constructor(private fintechService: FintechService, private authService: AuthService) {}

  ngOnInit(): void {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.fintechService.getWalletByOwner(userId).subscribe({
        next: w => this.wallet = w,
        error: () => this.wallet = null
      });
    }
  }
}
