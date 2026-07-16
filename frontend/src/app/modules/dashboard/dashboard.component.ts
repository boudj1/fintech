import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="content-wrapper">
      <h1>Dashboard</h1>
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon color="primary">people</mat-icon>
            <div class="stat-value">{{customerStats?.total ?? '...'}}</div>
            <div class="stat-label">Total Customers</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon color="accent">chat</mat-icon>
            <div class="stat-value">{{conversationStats?.total ?? '...'}}</div>
            <div class="stat-label">Total Conversations</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon style="color:#4caf50">check_circle</mat-icon>
            <div class="stat-value">{{conversationStats?.resolved ?? '...'}}</div>
            <div class="stat-label">Resolved</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon style="color:#ff9800">pending</mat-icon>
            <div class="stat-value">{{conversationStats?.open ?? '...'}}</div>
            <div class="stat-label">Open</div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px; margin-top:24px; }
    .stat-card { text-align:center; }
    .stat-card mat-card-content { padding:24px; display:flex; flex-direction:column; align-items:center; gap:8px; }
    .stat-card mat-icon { font-size:40px; width:40px; height:40px; }
    .stat-value { font-size:32px; font-weight:700; }
    .stat-label { font-size:14px; color:#666; }
  `]
})
export class DashboardComponent implements OnInit {
  customerStats: any = null;
  conversationStats: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get(`${environment.apiUrl}/customers/stats`).subscribe(s => this.customerStats = s);
    this.http.get(`${environment.apiUrl}/conversations/stats`).subscribe(s => this.conversationStats = s);
  }
}
