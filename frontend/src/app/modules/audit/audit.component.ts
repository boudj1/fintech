import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule],
  template: `
    <div class="content-wrapper">
      <h1>Audit Log</h1>
      @if (loading) {
        <div style="text-align:center;padding:48px"><mat-spinner></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="logs" class="mat-elevation-z2">
          <ng-container matColumnDef="timestamp">
            <th mat-header-cell *matHeaderCellDef>Timestamp</th>
            <td mat-cell *matCellDef="let l">{{l.createdAt | date:'medium'}}</td>
          </ng-container>
          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef>User</th>
            <td mat-cell *matCellDef="let l">{{l.username}}</td>
          </ng-container>
          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef>Action</th>
            <td mat-cell *matCellDef="let l">{{l.action}}</td>
          </ng-container>
          <ng-container matColumnDef="entity">
            <th mat-header-cell *matHeaderCellDef>Entity</th>
            <td mat-cell *matCellDef="let l">{{l.entityType}} #{{l.entityId}}</td>
          </ng-container>
          <ng-container matColumnDef="ip">
            <th mat-header-cell *matHeaderCellDef>IP Address</th>
            <td mat-cell *matCellDef="let l">{{l.ipAddress}}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [length]="totalElements" [pageSize]="50" (page)="onPage($event)"></mat-paginator>
      }
    </div>
  `,
  styles: ['table { width:100%; }']
})
export class AuditComponent implements OnInit {
  logs: any[] = [];
  displayedColumns = ['timestamp', 'user', 'action', 'entity', 'ip'];
  loading = false;
  totalElements = 0;
  pageIndex = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/audit`, { params: { page: this.pageIndex, size: 50 } }).subscribe({
      next: res => { this.logs = res.content; this.totalElements = res.totalElements; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onPage(event: PageEvent): void { this.pageIndex = event.pageIndex; this.load(); }
}
