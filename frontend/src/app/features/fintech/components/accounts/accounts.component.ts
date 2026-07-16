import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FintechService } from '../../services/fintech.service';
import { Account } from '../../models/account.model';

@Component({
  selector: 'app-accounts',
  template: `
    <div class="content-wrapper">
      <h1>Accounts</h1>
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th><th>Account Number</th><th>Type</th><th>Balance</th><th>Currency</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let acc of accounts">
            <td>{{ acc.id }}</td>
            <td>{{ acc.accountNumber }}</td>
            <td>{{ acc.type }}</td>
            <td>{{ acc.balance | number:'1.2-2' }}</td>
            <td>{{ acc.currency }}</td>
            <td><span [class]="'badge badge-' + acc.status.toLowerCase()">{{ acc.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .data-table { width:100%; border-collapse:collapse; }
    .data-table th, .data-table td { padding:12px; text-align:left; border-bottom:1px solid #e0e0e0; }
    .badge { padding:4px 8px; border-radius:4px; font-size:12px; font-weight:600; }
    .badge-active { background:#e8f5e9; color:#2e7d32; }
    .badge-suspended { background:#fff3e0; color:#e65100; }
  `]
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];

  constructor(private fintechService: FintechService) {}

  ngOnInit(): void {
    this.fintechService.getAccounts().subscribe(res => this.accounts = res.content);
  }
}
