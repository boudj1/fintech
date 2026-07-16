import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatChipsModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="content-wrapper">
      <div class="page-header"><h1>Conversations</h1></div>
      @if (loading) {
        <div style="text-align:center;padding:48px"><mat-spinner></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="conversations" class="mat-elevation-z2">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>#</th>
            <td mat-cell *matCellDef="let c">{{c.id}}</td>
          </ng-container>
          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef>Customer</th>
            <td mat-cell *matCellDef="let c">{{c.customerName || 'Unknown'}}</td>
          </ng-container>
          <ng-container matColumnDef="subject">
            <th mat-header-cell *matHeaderCellDef>Subject</th>
            <td mat-cell *matCellDef="let c">{{c.subject || 'No subject'}}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let c">
              <mat-chip [class]="c.status.toLowerCase()">{{c.status}}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="channel">
            <th mat-header-cell *matHeaderCellDef>Channel</th>
            <td mat-cell *matCellDef="let c">{{c.channel}}</td>
          </ng-container>
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let c">{{c.createdAt | date:'short'}}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [length]="totalElements" [pageSize]="pageSize" (page)="onPage($event)"></mat-paginator>
      }
    </div>
  `,
  styles: [`
    table { width: 100%; }
    mat-chip.open { background:#e3f2fd; color:#1565c0; }
    mat-chip.in_progress { background:#fff8e1; color:#f57f17; }
    mat-chip.resolved { background:#e8f5e9; color:#2e7d32; }
    mat-chip.escalated { background:#fff3e0; color:#e65100; }
    mat-chip.closed { background:#f5f5f5; color:#757575; }
  `]
})
export class ConversationsComponent implements OnInit {
  conversations: any[] = [];
  displayedColumns = ['id', 'customer', 'subject', 'status', 'channel', 'createdAt'];
  loading = false;
  pageSize = 20;
  pageIndex = 0;
  totalElements = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/conversations`, { params: { page: this.pageIndex, size: this.pageSize } }).subscribe({
      next: res => { this.conversations = res.content; this.totalElements = res.totalElements; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onPage(event: PageEvent): void { this.pageIndex = event.pageIndex; this.pageSize = event.pageSize; this.load(); }
}
