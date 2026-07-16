import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConversationService } from '../../core/services/conversation.service';
import { Conversation } from '../../core/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page animate-up">
      <div class="page-header">
        <div>
          <h2>Notifications</h2>
          <p>Updates on your support cases and account activity</p>
        </div>
      </div>

      <div class="card">
        @if (loading()) {
          <div class="spinner-wrap"><div class="spinner"></div></div>
        } @else if (items().length === 0) {
          <div class="empty-state">
            <i class="fas fa-bell-slash"></i>
            <h3>No notifications</h3>
            <p>You're all caught up! Check back later for updates.</p>
          </div>
        } @else {
          <div class="notif-list">
            @for (n of items(); track n.id) {
              <a [routerLink]="['/conversations', n.id]" class="notif-item" [class.unread]="n.status === 'OPEN'">
                <div class="notif-icon" [class]="'icon-' + n.status.toLowerCase()">
                  <i class="fas" [class]="statusIcon(n.status)"></i>
                </div>
                <div class="notif-body">
                  <div class="notif-title">{{ notifTitle(n) }}</div>
                  <div class="notif-msg">{{ n.subject }}</div>
                  <div class="notif-time">{{ n.updatedAt | date:'MMM d, y · h:mm a' }}</div>
                </div>
                @if (n.status === 'OPEN') {
                  <div class="unread-dot"></div>
                }
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .page-header h2 { margin-bottom: .25rem; }
    .page-header p { color: var(--text-muted); font-size: .88rem; }

    .notif-list { display: flex; flex-direction: column; }
    .notif-item {
      display: flex; align-items: center; gap: 1rem;
      padding: 1.1rem; border-bottom: 1px solid var(--border);
      text-decoration: none; color: var(--text); transition: var(--transition);
      position: relative;
      &:last-child { border-bottom: none; }
      &:hover { background: var(--bg2); border-radius: 10px; margin: 0 -.5rem; padding-left: 1.5rem; padding-right: 1.5rem; }
      &.unread { background: rgba(25,205,187,.04); }
    }
    .notif-icon {
      width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 1rem;
    }
    .icon-open       { background: rgba(59,130,246,.12); color: #3b82f6; }
    .icon-in_progress{ background: rgba(245,158,11,.12); color: #f59e0b; }
    .icon-resolved   { background: rgba(34,197,94,.12);  color: #22c55e; }
    .icon-escalated  { background: rgba(239,68,68,.12);  color: #ef4444; }
    .icon-closed     { background: rgba(100,116,139,.12);color: var(--text-muted); }

    .notif-body { flex: 1; min-width: 0; }
    .notif-title { font-weight: 600; font-size: .9rem; margin-bottom: .2rem; }
    .notif-msg { font-size: .83rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notif-time { font-size: .75rem; color: var(--text-muted); margin-top: .25rem; }
    .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); flex-shrink: 0; }

    .empty-state { padding: 3.5rem; text-align: center; i{font-size:2.5rem;color:var(--text-muted);margin-bottom:1rem;display:block;} h3{margin-bottom:.5rem;} p{color:var(--text-muted);} }
  `]
})
export class NotificationsComponent implements OnInit {
  items = signal<Conversation[]>([]);
  loading = signal(true);

  constructor(private svc: ConversationService) {}

  ngOnInit(): void {
    this.svc.getAll(0, 50).subscribe({
      next: p => { this.items.set(p.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  statusIcon(s: string): string {
    const m: Record<string,string> = { OPEN:'fa-folder-open', IN_PROGRESS:'fa-spinner', RESOLVED:'fa-check-circle', ESCALATED:'fa-exclamation-triangle', CLOSED:'fa-archive' };
    return m[s] ?? 'fa-bell';
  }

  notifTitle(c: Conversation): string {
    const m: Record<string,string> = { OPEN:'New case opened', IN_PROGRESS:'Case in progress', RESOLVED:'Case resolved ✓', ESCALATED:'⚠ Case escalated', CLOSED:'Case closed' };
    return m[c.status] ?? 'Case updated';
  }
}
