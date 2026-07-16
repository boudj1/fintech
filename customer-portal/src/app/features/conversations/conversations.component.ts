import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ConversationService } from '../../core/services/conversation.service';
import { Conversation, ConversationStatus } from '../../core/models';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page animate-up">
      <div class="page-header">
        <div>
          <h2>My Cases</h2>
          <p>Track and manage your support requests</p>
        </div>
        <a routerLink="/new-request" class="btn btn-primary">
          <i class="fas fa-plus"></i> New Request
        </a>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <div class="search-wrap">
          <i class="fas fa-search"></i>
          <input class="form-control" type="text" [(ngModel)]="searchQ" (input)="onSearch()"
            placeholder="Search cases…">
        </div>
        <div class="filter-chips">
          @for (s of statusFilters; track s.value) {
            <button class="chip" [class.active]="activeStatus() === s.value" (click)="setStatus(s.value)">
              {{ s.label }}
            </button>
          }
        </div>
        <button class="btn btn-secondary btn-sm" (click)="exportCsv()">
          <i class="fas fa-download"></i> Export
        </button>
      </div>

      <!-- Table -->
      <div class="card">
        @if (loading()) {
          <div class="spinner-wrap"><div class="spinner"></div></div>
        } @else if (filtered().length === 0) {
          <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <h3>No cases found</h3>
            <p>Try adjusting your filters or <a routerLink="/new-request">create a new request</a>.</p>
          </div>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Subject</th><th>Status</th><th>Channel</th>
                  <th>Messages</th><th>Created</th><th></th>
                </tr>
              </thead>
              <tbody>
                @for (c of filtered(); track c.id) {
                  <tr>
                    <td class="id-cell">#{{ c.id }}</td>
                    <td class="subject-cell">
                      <div>{{ c.subject }}</div>
                      @if (c.assignedAgentName) {
                        <small>Agent: {{ c.assignedAgentName }}</small>
                      }
                    </td>
                    <td><span class="badge" [class]="'badge-' + c.status.toLowerCase()">{{ c.status }}</span></td>
                    <td>
                      <span class="channel-badge">
                        <i class="fas" [class]="channelIcon(c.channel)"></i> {{ c.channel }}
                      </span>
                    </td>
                    <td class="center">{{ c.messageCount }}</td>
                    <td>{{ c.createdAt | date:'MMM d, y' }}</td>
                    <td>
                      <a [routerLink]="['/conversations', c.id]" class="btn btn-ghost btn-sm">
                        View <i class="fas fa-arrow-right" style="font-size:.7rem"></i>
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Pagination -->
      @if (total() > pageSize) {
        <div class="pagination">
          <button class="btn btn-secondary btn-sm" (click)="changePage(page()-1)" [disabled]="page()===0">
            <i class="fas fa-chevron-left"></i> Prev
          </button>
          <span>Page {{ page()+1 }} of {{ totalPages() }}</span>
          <button class="btn btn-secondary btn-sm" (click)="changePage(page()+1)" [disabled]="page()>=totalPages()-1">
            Next <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .page-header h2 { margin-bottom: .25rem; }
    .page-header p { color: var(--text-muted); font-size: .88rem; }

    .filter-bar { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .search-wrap {
      position: relative; flex: 1; min-width: 200px;
      i { position: absolute; left: .9rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
      .form-control { padding-left: 2.5rem; }
    }
    .filter-chips { display: flex; gap: .4rem; flex-wrap: wrap; }
    .chip {
      padding: .35rem .9rem; border-radius: 999px; border: 1px solid var(--border);
      background: var(--bg2); color: var(--text-muted); font-size: .82rem; font-weight: 500; cursor: pointer;
      transition: var(--transition);
      &.active { background: var(--primary); color: #04231f; border-color: var(--primary); }
      &:hover:not(.active) { border-color: var(--primary); color: var(--primary); }
    }

    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: .75rem 1rem; font-size: .78rem; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: var(--text-muted); border-bottom: 1px solid var(--border); }
    td { padding: .9rem 1rem; border-bottom: 1px solid var(--border); font-size: .88rem; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--bg2); }
    .id-cell { color: var(--text-muted); font-weight: 600; font-size: .82rem; }
    .subject-cell div { font-weight: 500; } .subject-cell small { color: var(--text-muted); font-size: .78rem; }
    .center { text-align: center; }

    .channel-badge {
      display: inline-flex; align-items: center; gap: .4rem;
      font-size: .8rem; color: var(--text-muted);
      i { font-size: .75rem; }
    }

    .pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; }
    .pagination span { color: var(--text-muted); font-size: .88rem; }

    .empty-state {
      padding: 3.5rem; text-align: center;
      i { font-size: 2.5rem; color: var(--text-muted); margin-bottom: 1rem; display: block; }
      h3 { margin-bottom: .5rem; }
      p { a { color: var(--primary); font-weight: 600; } }
    }
    @media(max-width:640px) {
      .filter-bar { flex-direction: column; align-items: stretch; }
      .search-wrap { min-width: unset; }
    }
  `]
})
export class ConversationsComponent implements OnInit {
  conversations = signal<Conversation[]>([]);
  loading = signal(true);
  page = signal(0);
  total = signal(0);
  pageSize = 20;
  activeStatus = signal<ConversationStatus | ''>('');
  searchQ = '';

  statusFilters = [
    { label: 'All', value: '' as const },
    { label: 'Open', value: 'OPEN' as ConversationStatus },
    { label: 'In Progress', value: 'IN_PROGRESS' as ConversationStatus },
    { label: 'Resolved', value: 'RESOLVED' as ConversationStatus },
    { label: 'Escalated', value: 'ESCALATED' as ConversationStatus },
  ];

  get totalPages(): () => number { return () => Math.ceil(this.total() / this.pageSize); }

  filtered(): Conversation[] {
    const q = this.searchQ.toLowerCase();
    return this.conversations().filter(c =>
      (!q || c.subject.toLowerCase().includes(q) || (c.customerName ?? '').toLowerCase().includes(q))
    );
  }

  constructor(private svc: ConversationService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      if (p['status']) this.activeStatus.set(p['status'] as ConversationStatus);
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    const status = this.activeStatus() || undefined;
    this.svc.getAll(this.page(), this.pageSize, status).subscribe({
      next: p => { this.conversations.set(p.content); this.total.set(p.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  setStatus(s: ConversationStatus | ''): void { this.activeStatus.set(s); this.page.set(0); this.load(); }
  changePage(p: number): void { this.page.set(p); this.load(); }
  onSearch(): void {}

  channelIcon(ch: string): string {
    const m: Record<string,string> = { WEB:'fa-globe', EMAIL:'fa-envelope', PHONE:'fa-phone', CHAT:'fa-comment' };
    return m[ch] ?? 'fa-comment';
  }

  exportCsv(): void {
    const rows = [['#','Subject','Status','Channel','Messages','Created']];
    this.conversations().forEach(c => rows.push([
      c.id.toString(), c.subject, c.status, c.channel, c.messageCount.toString(),
      new Date(c.createdAt).toLocaleDateString()
    ]));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'cases.csv'; a.click();
  }
}
