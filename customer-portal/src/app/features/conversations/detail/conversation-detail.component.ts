import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConversationService } from '../../../core/services/conversation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Conversation, ConversationMessage } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-conversation-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page animate-up">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <a routerLink="/conversations"><i class="fas fa-arrow-left"></i> My Cases</a>
        <span>/</span>
        <span>Case #{{ conv()?.id }}</span>
      </div>

      @if (!conv()) {
        <div class="spinner-wrap"><div class="spinner"></div></div>
      } @else {
        <!-- Header -->
        <div class="case-header card">
          <div class="case-info">
            <div class="case-subject">{{ conv()!.subject }}</div>
            <div class="case-meta">
              <span class="badge" [class]="'badge-' + conv()!.status.toLowerCase()">{{ conv()!.status }}</span>
              <span class="sep">·</span>
              <i class="fas" [class]="channelIcon(conv()!.channel)"></i> {{ conv()!.channel }}
              <span class="sep">·</span>
              Opened {{ conv()!.createdAt | date:'MMM d, y' }}
              @if (conv()!.assignedAgentName) {
                <span class="sep">·</span>
                <i class="fas fa-user-tie"></i> {{ conv()!.assignedAgentName }}
              }
            </div>
          </div>
          @if (conv()!.status !== 'RESOLVED' && conv()!.status !== 'CLOSED') {
            <button class="btn btn-secondary btn-sm" (click)="closeCase()">
              <i class="fas fa-check"></i> Mark Resolved
            </button>
          }
          @if (conv()!.status === 'RESOLVED' && !conv()!.satisfactionScore) {
            <div class="rating-wrap">
              <span>Rate your experience:</span>
              @for (n of [1,2,3,4,5]; track n) {
                <button class="star-btn" [class.active]="n <= (hoverRating || 0)" (mouseenter)="hoverRating=n" (mouseleave)="hoverRating=0" (click)="rate(n)">★</button>
              }
            </div>
          }
        </div>

        <!-- Messages -->
        <div class="card message-card">
          <div class="messages-area" #msgArea>
            @for (m of messages(); track m.id) {
              <div class="msg-row" [class.bot]="m.senderType==='BOT'" [class.agent]="m.senderType==='AGENT'" [class.customer]="m.senderType==='CUSTOMER'">
                <div class="msg-av">
                  @if (m.senderType === 'BOT') { <i class="fas fa-robot"></i> }
                  @else if (m.senderType === 'AGENT') { AG }
                  @else { ME }
                </div>
                <div class="msg-body">
                  <div class="msg-bubble" [class.ai]="m.aiGenerated">
                    {{ m.content }}
                    @if (m.aiGenerated) { <span class="ai-tag">AI</span> }
                  </div>
                  <div class="msg-time">
                    {{ m.senderName || m.senderType }} · {{ m.createdAt | date:'MMM d, h:mm a' }}
                  </div>
                </div>
              </div>
            }
            @if (messages().length === 0) {
              <div class="empty-msgs">No messages yet. Start the conversation below.</div>
            }
          </div>

          @if (conv()!.status !== 'CLOSED' && conv()!.status !== 'RESOLVED') {
            <div class="reply-bar">
              <textarea class="form-control" [(ngModel)]="draft" (keydown.enter)="onEnter($event)" placeholder="Write a message… (Ctrl+Enter to send)" rows="2"></textarea>
              <button class="btn btn-primary" (click)="sendMsg()" [disabled]="!draft.trim() || sending()">
                @if (sending()) { <span class="spinner-sm"></span> }
                @else { <i class="fas fa-paper-plane"></i> }
                Send
              </button>
            </div>
            <div class="reply-hint">Press Ctrl+Enter to send</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.25rem; }
    .breadcrumb { display: flex; align-items: center; gap: .6rem; font-size: .88rem; color: var(--text-muted); a{color:var(--primary);text-decoration:none;display:flex;align-items:center;gap:.4rem;&:hover{color:var(--primary-dark);}} span{color:var(--text-muted);} }
    .case-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .case-subject { font-size: 1.15rem; font-weight: 700; color: var(--text); margin-bottom: .5rem; }
    .case-meta { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; font-size: .82rem; color: var(--text-muted); i{font-size:.75rem;} }
    .sep { color: var(--border); }
    .rating-wrap { display: flex; align-items: center; gap: .4rem; font-size: .88rem; color: var(--text-muted); }
    .star-btn { background: none; border: none; font-size: 1.4rem; color: var(--border); cursor: pointer; transition: color .15s; &.active{color:#f59e0b;} }

    .message-card { padding: 0; }
    .messages-area { padding: 1.25rem; overflow-y: auto; max-height: 480px; display: flex; flex-direction: column; gap: 1rem; scroll-behavior: smooth; }
    .messages-area::-webkit-scrollbar { width: 5px; }
    .messages-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

    .msg-row { display: flex; gap: .75rem; align-items: flex-end; }
    .msg-row.customer { flex-direction: row-reverse; }

    .msg-av {
      width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: .75rem;
    }
    .bot .msg-av    { background: rgba(25,205,187,.15); color: var(--primary); }
    .agent .msg-av  { background: rgba(59,130,246,.15); color: #3b82f6; }
    .customer .msg-av { background: linear-gradient(135deg,var(--primary),var(--primary-dark)); color:#04231f; }

    .msg-body { max-width: 75%; display: flex; flex-direction: column; }
    .msg-bubble {
      padding: .8rem 1.1rem; border-radius: 14px; font-size: .88rem; line-height: 1.55; white-space: pre-wrap; word-break: break-word; position: relative;
    }
    .bot .msg-bubble, .agent .msg-bubble { background: var(--bg2); border: 1px solid var(--border); color: var(--text); border-radius: 14px 14px 14px 4px; }
    .customer .msg-bubble { background: linear-gradient(135deg,var(--primary),var(--primary-dark)); color:#04231f; font-weight:500; border-radius:14px 14px 4px 14px; }
    .msg-bubble.ai { border-left: 3px solid var(--primary); }
    .ai-tag { position:absolute; top:-.4rem; right:-.4rem; background:var(--primary); color:#04231f; font-size:.65rem; font-weight:700; padding:.1rem .4rem; border-radius:999px; }
    .msg-time { font-size: .72rem; color: var(--text-muted); margin-top: .35rem; padding: 0 .35rem; }
    .customer .msg-body { align-items: flex-end; }

    .empty-msgs { text-align: center; padding: 2rem; color: var(--text-muted); font-size: .88rem; }

    .reply-bar {
      display: flex; gap: .75rem; padding: 1.25rem; border-top: 1px solid var(--border);
      textarea { resize: none; }
      .btn { align-self: flex-end; padding: .7rem 1.25rem; }
    }
    .reply-hint { font-size: .75rem; color: var(--text-muted); text-align: right; padding: 0 1.25rem .75rem; }
    .spinner-sm { width:14px; height:14px; border-radius:50%; border:2px solid rgba(4,35,31,.3); border-top-color:#04231f; animation:spin .7s linear infinite; display:inline-block; }
    @keyframes spin{to{transform:rotate(360deg)}}
  `]
})
export class ConversationDetailComponent implements OnInit, AfterViewChecked {
  @ViewChild('msgArea') msgArea!: ElementRef<HTMLElement>;

  conv = signal<Conversation | null>(null);
  messages = signal<ConversationMessage[]>([]);
  draft = '';
  sending = signal(false);
  hoverRating = 0;
  private scrollNeeded = false;

  constructor(
    private route: ActivatedRoute,
    private svc: ConversationService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getById(id).subscribe({ next: c => this.conv.set(c), error: () => {} });
    this.svc.getMessages(id).subscribe({ next: m => { this.messages.set(m); this.scrollNeeded = true; }, error: () => {} });
  }

  ngAfterViewChecked(): void {
    if (this.scrollNeeded) { this.scrollBottom(); this.scrollNeeded = false; }
  }

  private scrollBottom(): void {
    if (this.msgArea?.nativeElement) {
      const el = this.msgArea.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  onEnter(e: Event): void { if ((e as KeyboardEvent).ctrlKey) { e.preventDefault(); this.sendMsg(); } }

  sendMsg(): void {
    const txt = this.draft.trim();
    if (!txt || this.sending()) return;
    this.draft = ''; this.sending.set(true);
    const user = this.auth.currentUser();
    this.svc.sendMessage(this.conv()!.id, {
      content: txt, senderType: 'CUSTOMER',
      senderName: user ? `${user.firstName} ${user.lastName}` : 'Me'
    }).subscribe({
      next: m => { this.messages.update(msgs => [...msgs, m]); this.sending.set(false); this.scrollNeeded = true; },
      error: () => { this.sending.set(false); this.toast.error('Failed to send', 'Please try again.'); }
    });
  }

  closeCase(): void {
    this.svc.updateStatus(this.conv()!.id, 'RESOLVED').subscribe({
      next: c => { this.conv.set(c); this.toast.success('Case resolved', 'Thank you for reaching out!'); },
      error: () => this.toast.error('Failed', 'Could not update case status.')
    });
  }

  rate(score: number): void {
    this.svc.rate(this.conv()!.id, score).subscribe({
      next: c => { this.conv.set(c); this.toast.success('Thank you!', `You rated this conversation ${score}/5.`); },
      error: () => {}
    });
  }

  channelIcon(ch: string): string {
    const m: Record<string,string> = { WEB:'fa-globe', EMAIL:'fa-envelope', PHONE:'fa-phone', CHAT:'fa-comment' };
    return m[ch] ?? 'fa-comment';
  }
}
