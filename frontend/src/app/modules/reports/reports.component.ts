import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

interface Stats {
  total: number; open: number; inProgress: number;
  resolved: number; escalated: number; avgSatisfactionScore: number | null;
}
interface Conversation {
  id: number; subject: string; status: string; channel: string;
  language: string; createdAt: string; satisfactionScore: number | null;
  customerName: string | null; assignedAgentName: string | null; messageCount: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="reports-page">
      <div class="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Live data from your enterprise platform</p>
        </div>
        <button mat-raised-button color="primary" (click)="refresh()" [disabled]="loading">
          <mat-icon>refresh</mat-icon> Refresh
        </button>
      </div>

      @if (loading) {
        <div class="loading-wrap"><mat-spinner diameter="48"></mat-spinner></div>
      } @else {

        <!-- KPI Row -->
        <div class="kpi-row">
          <div class="kpi-card total">
            <mat-icon>forum</mat-icon>
            <div class="kpi-val">{{ stats?.total ?? 0 }}</div>
            <div class="kpi-label">Total Conversations</div>
          </div>
          <div class="kpi-card open">
            <mat-icon>folder_open</mat-icon>
            <div class="kpi-val">{{ stats?.open ?? 0 }}</div>
            <div class="kpi-label">Open</div>
          </div>
          <div class="kpi-card progress">
            <mat-icon>sync</mat-icon>
            <div class="kpi-val">{{ stats?.inProgress ?? 0 }}</div>
            <div class="kpi-label">In Progress</div>
          </div>
          <div class="kpi-card resolved">
            <mat-icon>check_circle</mat-icon>
            <div class="kpi-val">{{ stats?.resolved ?? 0 }}</div>
            <div class="kpi-label">Resolved</div>
          </div>
          <div class="kpi-card escalated">
            <mat-icon>warning</mat-icon>
            <div class="kpi-val">{{ stats?.escalated ?? 0 }}</div>
            <div class="kpi-label">Escalated</div>
          </div>
          <div class="kpi-card satisfaction">
            <mat-icon>star</mat-icon>
            <div class="kpi-val">{{ stats?.avgSatisfactionScore ? (stats!.avgSatisfactionScore | number:'1.1-1') : 'N/A' }}</div>
            <div class="kpi-label">Avg Satisfaction</div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">

          <!-- Status Distribution -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>pie_chart</mat-icon>
              <mat-card-title>Status Distribution</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @for (item of statusData; track item.label) {
                <div class="bar-row">
                  <span class="bar-label">{{ item.label }}</span>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width.%]="item.pct" [style.background]="item.color"></div>
                  </div>
                  <span class="bar-val">{{ item.count }} ({{ item.pct | number:'1.0-0' }}%)</span>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <!-- Channel Breakdown -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>devices</mat-icon>
              <mat-card-title>Channel Breakdown</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @for (item of channelData; track item.label) {
                <div class="bar-row">
                  <span class="bar-label">{{ item.label }}</span>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width.%]="item.pct" [style.background]="item.color"></div>
                  </div>
                  <span class="bar-val">{{ item.count }}</span>
                </div>
              }
              @if (channelData.length === 0) {
                <p class="no-data">No data available</p>
              }
            </mat-card-content>
          </mat-card>

          <!-- Language Breakdown -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>language</mat-icon>
              <mat-card-title>Language Distribution</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @for (item of languageData; track item.label) {
                <div class="bar-row">
                  <span class="bar-label">{{ item.label | uppercase }}</span>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width.%]="item.pct" style="background:#7c3aed"></div>
                  </div>
                  <span class="bar-val">{{ item.count }}</span>
                </div>
              }
            </mat-card-content>
          </mat-card>

        </div>

        <!-- Export Cards -->
        <div class="export-row">
          <mat-card class="export-card">
            <mat-card-content>
              <mat-icon style="color:#1565c0;font-size:40px;width:40px;height:40px">chat</mat-icon>
              <h3>Conversation Report</h3>
              <p>All conversations with status, channel, agent assignment and timestamps</p>
              <button mat-raised-button color="primary" (click)="exportConversations()">
                <mat-icon>download</mat-icon> Export CSV
              </button>
            </mat-card-content>
          </mat-card>

          <mat-card class="export-card">
            <mat-card-content>
              <mat-icon style="color:#2e7d32;font-size:40px;width:40px;height:40px">bar_chart</mat-icon>
              <h3>Stats Summary</h3>
              <p>KPI summary: totals, resolution rates, satisfaction scores by status</p>
              <button mat-raised-button color="primary" (click)="exportStats()">
                <mat-icon>download</mat-icon> Export CSV
              </button>
            </mat-card-content>
          </mat-card>

          <mat-card class="export-card">
            <mat-card-content>
              <mat-icon style="color:#e65100;font-size:40px;width:40px;height:40px">star_rate</mat-icon>
              <h3>Satisfaction Report</h3>
              <p>Conversations that were rated — scores, subjects, agents and resolution times</p>
              <button mat-raised-button color="primary" (click)="exportSatisfaction()">
                <mat-icon>download</mat-icon> Export CSV
              </button>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Recent Table -->
        <mat-card class="table-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>list</mat-icon>
            <mat-card-title>Recent Conversations</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Subject</th><th>Customer</th>
                    <th>Status</th><th>Channel</th><th>Agent</th>
                    <th>Messages</th><th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of conversations.slice(0,15); track c.id) {
                    <tr>
                      <td>{{ c.id }}</td>
                      <td>{{ c.subject }}</td>
                      <td>{{ c.customerName || '—' }}</td>
                      <td><span class="status-pill" [class]="c.status.toLowerCase()">{{ c.status }}</span></td>
                      <td>{{ c.channel }}</td>
                      <td>{{ c.assignedAgentName || '—' }}</td>
                      <td style="text-align:center">{{ c.messageCount }}</td>
                      <td>{{ c.createdAt | date:'MMM d, y' }}</td>
                    </tr>
                  }
                  @if (conversations.length === 0) {
                    <tr><td colspan="8" style="text-align:center;padding:2rem;color:#666">No conversations yet</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </mat-card-content>
        </mat-card>

      }
    </div>
  `,
  styles: [`
    .reports-page { padding: 8px; display: flex; flex-direction: column; gap: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .page-header h1 { margin: 0 0 4px; font-size: 1.6rem; }
    .page-header p  { margin: 0; color: #666; font-size: .88rem; }
    .loading-wrap   { display: flex; justify-content: center; padding: 60px; }

    /* KPIs */
    .kpi-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
    .kpi-card {
      border-radius: 12px; padding: 20px 16px; display: flex; flex-direction: column;
      align-items: center; gap: 8px; text-align: center; color: white;
      mat-icon { font-size: 32px; width: 32px; height: 32px; opacity: .9; }
    }
    .kpi-val   { font-size: 2rem; font-weight: 700; line-height: 1; }
    .kpi-label { font-size: .78rem; opacity: .85; font-weight: 500; }
    .kpi-card.total       { background: linear-gradient(135deg,#1565c0,#1976d2); }
    .kpi-card.open        { background: linear-gradient(135deg,#0277bd,#0288d1); }
    .kpi-card.progress    { background: linear-gradient(135deg,#e65100,#f57c00); }
    .kpi-card.resolved    { background: linear-gradient(135deg,#2e7d32,#388e3c); }
    .kpi-card.escalated   { background: linear-gradient(135deg,#b71c1c,#c62828); }
    .kpi-card.satisfaction{ background: linear-gradient(135deg,#6a1b9a,#7b1fa2); }

    /* Bar Charts */
    .charts-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .chart-card mat-card-content { padding-top: 12px; display: flex; flex-direction: column; gap: 12px; }
    .bar-row { display: flex; align-items: center; gap: 10px; }
    .bar-label { width: 90px; font-size: .82rem; color: #555; flex-shrink: 0; }
    .bar-track { flex: 1; height: 10px; background: #e8e8e8; border-radius: 5px; overflow: hidden; }
    .bar-fill  { height: 100%; border-radius: 5px; transition: width .6s ease; min-width: 4px; }
    .bar-val   { width: 70px; font-size: .78rem; color: #666; text-align: right; flex-shrink: 0; }
    .no-data   { text-align: center; color: #999; padding: 16px; font-size: .88rem; }

    /* Export Cards */
    .export-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .export-card mat-card-content {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; gap: 10px; padding: 28px 16px;
      h3 { margin: 0; } p { margin: 0; color: #666; font-size: .85rem; }
    }

    /* Table */
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: .85rem; }
    th { padding: 10px 12px; text-align: left; font-size: .75rem; font-weight: 600; text-transform: uppercase;
         letter-spacing: .04em; color: #666; border-bottom: 2px solid #e0e0e0; }
    td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
    tr:hover td { background: #fafafa; }
    .status-pill { padding: 3px 10px; border-radius: 999px; font-size: .75rem; font-weight: 600; }
    .status-pill.open        { background: #e3f2fd; color: #1565c0; }
    .status-pill.in_progress { background: #fff3e0; color: #e65100; }
    .status-pill.resolved    { background: #e8f5e9; color: #2e7d32; }
    .status-pill.escalated   { background: #ffebee; color: #b71c1c; }
    .status-pill.closed      { background: #f5f5f5; color: #757575; }
  `]
})
export class ReportsComponent implements OnInit {
  loading    = true;
  stats: Stats | null = null;
  conversations: Conversation[] = [];
  statusData:   { label: string; count: number; pct: number; color: string }[] = [];
  channelData:  { label: string; count: number; pct: number; color: string }[] = [];
  languageData: { label: string; count: number; pct: number }[] = [];

  private readonly CHANNEL_COLORS: Record<string, string> = {
    WEB:'#1565c0', EMAIL:'#2e7d32', PHONE:'#e65100', CHAT:'#6a1b9a', WEB_CHAT:'#00838f'
  };

  constructor(private http: HttpClient) {}

  ngOnInit() { this.refresh(); }

  refresh() {
    this.loading = true;
    const token = localStorage.getItem('accessToken') || '';
    const h = new HttpHeaders({ Authorization: `Bearer ${token}` });

    forkJoin({
      stats: this.http.get<Stats>('/api/conversations/stats', { headers: h }),
      convs: this.http.get<{ content: Conversation[] }>('/api/conversations?page=0&size=100', { headers: h })
    }).subscribe({
      next: ({ stats, convs }) => {
        this.stats         = stats;
        this.conversations = convs.content || [];
        this.buildCharts(stats, this.conversations);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private buildCharts(s: Stats, convs: Conversation[]) {
    const total = s.total || 1;

    this.statusData = [
      { label:'Open',        count: s.open,        pct: s.open        / total * 100, color:'#1976d2' },
      { label:'In Progress', count: s.inProgress,  pct: s.inProgress  / total * 100, color:'#f57c00' },
      { label:'Resolved',    count: s.resolved,    pct: s.resolved    / total * 100, color:'#388e3c' },
      { label:'Escalated',   count: s.escalated,   pct: s.escalated   / total * 100, color:'#c62828' },
    ].filter(x => x.count > 0);

    const chanMap: Record<string, number> = {};
    convs.forEach(c => { chanMap[c.channel] = (chanMap[c.channel] || 0) + 1; });
    this.channelData = Object.entries(chanMap)
      .sort((a,b) => b[1]-a[1])
      .map(([label, count]) => ({ label, count, pct: count / total * 100, color: this.CHANNEL_COLORS[label] || '#888' }));

    const langMap: Record<string, number> = {};
    convs.forEach(c => { langMap[c.language||'unknown'] = (langMap[c.language||'unknown'] || 0) + 1; });
    this.languageData = Object.entries(langMap)
      .sort((a,b) => b[1]-a[1])
      .map(([label, count]) => ({ label, count, pct: count / total * 100 }));
  }

  exportConversations() {
    let csv = 'ID,Subject,Customer,Status,Channel,Language,Agent,Messages,Created,Satisfaction\n';
    this.conversations.forEach(c =>
      csv += `${c.id},"${c.subject}","${c.customerName||''}","${c.status}","${c.channel}","${c.language}","${c.assignedAgentName||''}",${c.messageCount},"${c.createdAt}",${c.satisfactionScore??''}\n`
    );
    this.download(csv, 'conversations-report.csv');
  }

  exportStats() {
    const s = this.stats;
    if (!s) return;
    const resRate = s.total ? ((s.resolved / s.total) * 100).toFixed(1) : '0';
    let csv = 'Metric,Value\n';
    csv += `Total Conversations,${s.total}\nOpen,${s.open}\nIn Progress,${s.inProgress}\nResolved,${s.resolved}\nEscalated,${s.escalated}\nResolution Rate (%),${resRate}\nAvg Satisfaction,${s.avgSatisfactionScore ?? 'N/A'}\n`;
    this.download(csv, 'stats-summary.csv');
  }

  exportSatisfaction() {
    const rated = this.conversations.filter(c => c.satisfactionScore != null);
    let csv = 'ID,Subject,Customer,Agent,Status,Satisfaction Score,Created\n';
    rated.forEach(c =>
      csv += `${c.id},"${c.subject}","${c.customerName||''}","${c.assignedAgentName||''}","${c.status}",${c.satisfactionScore},"${c.createdAt}"\n`
    );
    if (rated.length === 0) csv += 'No rated conversations yet.\n';
    this.download(csv, 'satisfaction-report.csv');
  }

  private download(csv: string, filename: string) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = filename;
    a.click();
  }
}
