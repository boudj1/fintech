import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatInputModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule],
  template: `
    <div class="content-wrapper">
      <div class="page-header">
        <h1>Customers</h1>
        <mat-form-field appearance="outline">
          <mat-label>Search</mat-label>
          <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" placeholder="Name, email, company...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      @if (loading) {
        <div style="text-align:center;padding:48px"><mat-spinner></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="customers" class="mat-elevation-z2">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let c">{{c.firstName}} {{c.lastName}}</td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let c">{{c.email}}</td>
          </ng-container>
          <ng-container matColumnDef="company">
            <th mat-header-cell *matHeaderCellDef>Company</th>
            <td mat-cell *matCellDef="let c">{{c.company || '-'}}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let c">
              <mat-chip [class]="c.status.toLowerCase()">{{c.status}}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let c">{{c.createdAt | date:'short'}}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [length]="totalElements" [pageSize]="pageSize" [pageSizeOptions]="[10,20,50]"
                       (page)="onPage($event)"></mat-paginator>
      }
    </div>
  `,
  styles: [`
    table { width: 100%; }
    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
    mat-chip.active { background:#e8f5e9; color:#2e7d32; }
    mat-chip.inactive { background:#f5f5f5; color:#757575; }
    mat-chip.blocked { background:#ffebee; color:#c62828; }
  `]
})
export class CustomersComponent implements OnInit {
  customers: any[] = [];
  displayedColumns = ['name', 'email', 'company', 'status', 'createdAt'];
  loading = false;
  searchQuery = '';
  pageSize = 20;
  pageIndex = 0;
  totalElements = 0;
  private searchTimer: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadCustomers(); }

  loadCustomers(): void {
    this.loading = true;
    const params: any = { page: this.pageIndex, size: this.pageSize };
    if (this.searchQuery) params.query = this.searchQuery;
    this.http.get<any>(`${environment.apiUrl}/customers`, { params }).subscribe({
      next: res => { this.customers = res.content; this.totalElements = res.totalElements; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.pageIndex = 0; this.loadCustomers(); }, 400);
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCustomers();
  }
}
