import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { CustomerStats } from '../../models/audit-log.model';
import { ChatService } from '../../../chatbot/services/chat.service';
import { ChatSessionStats } from '../../../chatbot/models/message.model';

@Component({
  selector: 'app-analytics',
  template: `
    <div class="content-wrapper">
      <h1>Analytics Dashboard</h1>
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-value">{{ customerStats?.total ?? '...' }}</div>
          <div class="stat-label">Total Customers</div>
        </div>
        <div class="stat-card green">
          <div class="stat-value">{{ customerStats?.active ?? '...' }}</div>
          <div class="stat-label">Active Customers</div>
        </div>
        <div class="stat-card orange">
          <div class="stat-value">{{ chatStats?.total ?? '...' }}</div>
          <div class="stat-label">Total Conversations</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-value">{{ chatStats?.resolved ?? '...' }}</div>
          <div class="stat-label">Resolved</div>
        </div>
        <div class="stat-card red">
          <div class="stat-value">{{ chatStats?.escalated ?? '...' }}</div>
          <div class="stat-label">Escalated</div>
        </div>
        <div class="stat-card teal">
          <div class="stat-value">{{ (chatStats?.avgSatisfactionScore ?? 0) | number:'1.1-1' }}/5</div>
          <div class="stat-label">Avg Satisfaction</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:16px; margin-top:24px; }
    .stat-card { padding:24px; border-radius:8px; color:white; text-align:center; }
    .stat-card.blue { background:#1565c0; }
    .stat-card.green { background:#2e7d32; }
    .stat-card.orange { background:#e65100; }
    .stat-card.purple { background:#6a1b9a; }
    .stat-card.red { background:#c62828; }
    .stat-card.teal { background:#00695c; }
    .stat-value { font-size:32px; font-weight:700; }
    .stat-label { font-size:13px; margin-top:8px; opacity:.9; }
  `]
})
export class AnalyticsComponent implements OnInit {
  customerStats: CustomerStats | null = null;
  chatStats: ChatSessionStats | null = null;

  constructor(private adminService: AdminService, private chatService: ChatService) {}

  ngOnInit(): void {
    this.adminService.getCustomerStats().subscribe(s => this.customerStats = s);
    this.chatService.getStats().subscribe(s => this.chatStats = s);
  }
}
