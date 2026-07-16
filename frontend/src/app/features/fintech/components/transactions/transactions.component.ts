import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FintechService } from '../../services/fintech.service';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-transactions',
  template: `
    <div class="content-wrapper">
      <h1>Transactions</h1>
      <table class="data-table">
        <thead>
          <tr>
            <th>Reference</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let tx of transactions">
            <td>{{ tx.referenceNumber }}</td>
            <td>{{ tx.type }}</td>
            <td>{{ tx.amount | number:'1.2-2' }} {{ tx.currency }}</td>
            <td><span [class]="'badge badge-' + tx.status.toLowerCase()">{{ tx.status }}</span></td>
            <td>{{ tx.createdAt | date:'short' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .data-table { width:100%; border-collapse:collapse; }
    .data-table th, .data-table td { padding:12px; text-align:left; border-bottom:1px solid #e0e0e0; }
    .badge { padding:4px 8px; border-radius:4px; font-size:12px; font-weight:600; }
    .badge-completed { background:#e8f5e9; color:#2e7d32; }
    .badge-pending { background:#fff8e1; color:#f57f17; }
    .badge-failed { background:#ffebee; color:#c62828; }
  `]
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];

  constructor(private fintechService: FintechService) {}

  ngOnInit(): void {
    this.fintechService.getTransactions().subscribe(res => this.transactions = res.content);
  }
}
