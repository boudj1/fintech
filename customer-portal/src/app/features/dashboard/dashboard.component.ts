import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConversationService } from '../../core/services/conversation.service';
import { AuthService } from '../../core/services/auth.service';
import { ConversationStats, Conversation } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page animate-up">

      <!-- ── Balance / Stats Hero ── -->
      <div class="hero-card">
        <div class="hero-inner">
          <div class="hero-left">
            <p class="hero-label">Total Cases</p>
            <div class="hero-value">
              @if (stats()) { {{ stats()!.total }} }
              @else { <span class="skeleton">···</span> }
            </div>
            @if (stats()) {
              <div class="hero-trend">
                <i class="fas fa-check-circle"></i>
                {{ stats()!.resolved }} resolved this period
              </div>
            }
            <div class="hero-actions">
              <a routerLink="/new-request" class="btn btn-dark">
                <i class="fas fa-paper-plane"></i> New Request
              </a>
              <a routerLink="/conversations" class="btn btn-ghost-dark">
                <i class="fas fa-history"></i> View All
              </a>
            </div>
          </div>
          <div class="hero-right">
            <div class="mini-bars">
              @for (b of bars; track $index) {
                <div class="mini-bar" [style.height.%]="b" [class.active]="$index === bars.length - 1"></div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- ── Stat Grid ── -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon open"><i class="fas fa-folder-open"></i></div>
          <div class="stat-body">
            <div class="stat-val">{{ stats()?.open ?? '—' }}</div>
            <div class="stat-lbl">Open Cases</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon progress"><i class="fas fa-spinner"></i></div>
          <div class="stat-body">
            <div class="stat-val">{{ stats()?.inProgress ?? '—' }}</div>
            <div class="stat-lbl">In Progress</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon resolved"><i class="fas fa-check-circle"></i></div>
          <div class="stat-body">
            <div class="stat-val">{{ stats()?.resolved ?? '—' }}</div>
            <div class="stat-lbl">Resolved</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon escalated"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="stat-body">
            <div class="stat-val">{{ stats()?.escalated ?? '—' }}</div>
            <div class="stat-lbl">Escalated</div>
          </div>
        </div>
      </div>

      <!-- ── Quick Actions ── -->
      <section>
        <h3 class="section-title">Quick Actions</h3>
        <div class="action-grid">
          <a routerLink="/new-request" class="action-btn">
            <i class="fas fa-paper-plane"></i>
            <span>New Support Request</span>
          </a>
          <a routerLink="/conversations?status=OPEN" class="action-btn">
            <i class="fas fa-folder-open"></i>
            <span>Open Cases</span>
          </a>
          <a routerLink="/conversations" class="action-btn">
            <i class="fas fa-history"></i>
            <span>All My Cases</span>
          </a>
          <a routerLink="/notifications" class="action-btn">
            <i class="fas fa-bell"></i>
            <span>Notifications</span>
          </a>
        </div>
      </section>

      <!-- ── Recent Cases ── -->
      <div class="card">
        <div class="card-header">
          <h3>Recent Cases</h3>
          <a routerLink="/conversations" class="card-link">View All →</a>
        </div>

        @if (loading()) {
          <div class="spinner-wrap"><div class="spinner"></div></div>
        } @else if (recent().length === 0) {
          <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>No cases yet. <a routerLink="/new-request">Create your first request</a></p>
          </div>
        } @else {
          <div class="case-list">
            @for (c of recent(); track c.id) {
              <a [routerLink]="['/conversations', c.id]" class="case-item">
                <div class="case-icon" [class]="'icon-' + c.status.toLowerCase()">
                  <i class="fas" [class]="channelIcon(c.channel)"></i>
                </div>
                <div class="case-body">
                  <div class="case-subject">{{ c.subject }}</div>
                  <div class="case-meta">{{ c.createdAt | date:'MMM d, y' }} · {{ c.messageCount }} messages</div>
                </div>
                <div class="case-right">
                  <span class="badge" [class]="'badge-' + c.status.toLowerCase()">{{ c.status }}</span>
                </div>
              </a>
            }
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.75rem; }
    .section-title { font-size: 1.1rem; margin-bottom: 1rem; color: var(--text); }

    /* Hero */
    .hero-card {
      background: linear-gradient(135deg, #19cdbb, #0fb5a4);
      border-radius: 20px; padding: 2.5rem;
      box-shadow: 0 12px 40px rgba(25,205,187,.25);
    }
    .hero-inner { display: flex; justify-content: space-between; align-items: flex-start; gap: 2rem; }
    .hero-label { font-size: .82rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: rgba(4,35,31,.65); margin-bottom: .75rem; }
    .hero-value { font-family: 'Space Grotesk',sans-serif; font-size: 3.5rem; font-weight: 700; color: #04231f; letter-spacing: -.02em; margin-bottom: .4rem; }
    .hero-trend { color: rgba(4,35,31,.7); font-size: .88rem; font-weight: 500; margin-bottom: 1.75rem; i { margin-right: .35rem; } }
    .hero-actions { display: flex; gap: .75rem; flex-wrap: wrap; }
    .btn-dark { background: rgba(4,35,31,.2); color: #04231f; border: 1px solid rgba(4,35,31,.15); &:hover{background:rgba(4,35,31,.3);} }
    .btn-ghost-dark { background: transparent; color: rgba(4,35,31,.7); border: 1px solid rgba(4,35,31,.2); &:hover{background:rgba(4,35,31,.1);color:#04231f;} }
    .hero-right { flex-shrink: 0; }
    .mini-bars { display: flex; align-items: flex-end; gap: 8px; height: 80px; }
    .mini-bar { flex: 1; min-width: 10px; background: rgba(4,35,31,.15); border-radius: 5px; }
    .mini-bar.active { background: rgba(4,35,31,.35); }
    .skeleton { display: inline-block; width: 60px; height: 1em; background: rgba(4,35,31,.15); border-radius: 6px; }

    /* Stat Grid */
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 1rem; }
    .stat-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 14px; padding: 1.25rem;
      display: flex; align-items: center; gap: 1rem;
      box-shadow: var(--shadow); transition: var(--transition);
      &:hover { border-color: var(--primary); box-shadow: 0 6px 18px rgba(25,205,187,.1); }
    }
    .stat-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;
    }
    .stat-icon.open       { background: rgba(59,130,246,.12);  color: #3b82f6; }
    .stat-icon.progress   { background: rgba(245,158,11,.12);  color: #f59e0b; }
    .stat-icon.resolved   { background: rgba(34,197,94,.12);   color: #22c55e; }
    .stat-icon.escalated  { background: rgba(239,68,68,.12);   color: #ef4444; }
    .stat-val { font-family: 'Space Grotesk',sans-serif; font-size: 1.6rem; font-weight: 700; color: var(--text); line-height: 1; }
    .stat-lbl { font-size: .8rem; color: var(--text-muted); margin-top: .25rem; }

    /* Action Grid */
    .action-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 1rem; }
    .action-btn {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 14px; padding: 1.5rem; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: .75rem;
      text-decoration: none; color: var(--text); transition: var(--transition);
      i { font-size: 1.8rem; color: var(--primary); }
      span { font-weight: 600; font-size: .88rem; }
      &:hover { border-color: var(--primary); transform: translateY(-3px); box-shadow: 0 10px 24px rgba(25,205,187,.15); }
    }

    /* Case List */
    .case-list { display: flex; flex-direction: column; }
    .case-item {
      display: flex; align-items: center; gap: 1rem;
      padding: 1rem; border-bottom: 1px solid var(--border);
      text-decoration: none; color: var(--text); transition: var(--transition);
      &:last-child { border-bottom: none; }
      &:hover { background: var(--bg2); border-radius: 10px; margin: 0 -.5rem; padding-left: 1.5rem; padding-right: 1.5rem; }
    }
    .case-icon {
      width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 1rem;
    }
    .case-icon.icon-open       { background: rgba(59,130,246,.12);  color: #3b82f6; }
    .case-icon.icon-in_progress{ background: rgba(245,158,11,.12);  color: #f59e0b; }
    .case-icon.icon-resolved   { background: rgba(34,197,94,.12);   color: #22c55e; }
    .case-icon.icon-escalated  { background: rgba(239,68,68,.12);   color: #ef4444; }
    .case-icon.icon-closed     { background: rgba(100,116,139,.12); color: var(--text-muted); }
    .case-body { flex: 1; min-width: 0; }
    .case-subject { font-weight: 500; font-size: .92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .case-meta { font-size: .8rem; color: var(--text-muted); margin-top: .2rem; }
    .case-right { flex-shrink: 0; }

    .empty-state {
      text-align: center; padding: 3rem;
      i { font-size: 2.5rem; color: var(--text-muted); margin-bottom: 1rem; display: block; }
      p { color: var(--text-muted); a{color:var(--primary); font-weight:600;} }
    }

    @media(max-width:768px) {
      .hero-value { font-size: 2.5rem; }
      .hero-right { display: none; }
      .stat-grid, .action-grid { grid-template-columns: repeat(2,1fr); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats = signal<ConversationStats | null>(null);
  recent = signal<Conversation[]>([]);
  loading = signal(true);
  bars = [44, 70, 38, 88, 56, 64, 75];

  constructor(private conversationSvc: ConversationService, public auth: AuthService) {}

  ngOnInit(): void {
    this.conversationSvc.getStats().subscribe({
      next: s => this.stats.set(s),
      error: () => {}
    });
    this.conversationSvc.getAll(0, 5).subscribe({
      next: p => { this.recent.set(p.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  channelIcon(ch: string): string {
    const m: Record<string,string> = {
      WEB: 'fa-globe', EMAIL: 'fa-envelope', PHONE: 'fa-phone', CHAT: 'fa-comment'
    };
    return m[ch] ?? 'fa-comment';
  }
}
