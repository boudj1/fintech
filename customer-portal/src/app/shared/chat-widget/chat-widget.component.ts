import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../core/services/chatbot.service';
import { ChatMessage } from '../../core/models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<!-- ── Toast Container ── -->
<div class="toast-container">
  @for (t of toast.toasts(); track t.id) {
    <div class="toast" [class]="t.type">
      <i class="fas" [class.fa-check-circle]="t.type==='success'" [class.fa-times-circle]="t.type==='error'" [class.fa-exclamation-circle]="t.type==='warning'" [class.fa-info-circle]="t.type==='info'"></i>
      <div class="toast-body">
        <strong>{{ t.title }}</strong>
        @if (t.message) { <span>{{ t.message }}</span> }
      </div>
      <button class="toast-close" (click)="toast.remove(t.id)">×</button>
    </div>
  }
</div>

<!-- ── Launcher ── -->
@if (!open) {
  <button class="launcher" (click)="open = true; unread = 0" title="Chat with AI Assistant">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    @if (unread > 0) { <span class="badge">{{ unread }}</span> }
  </button>
}

<!-- ── Chat Panel ── -->
@if (open) {
  <div class="panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="hdr-avatar-wrap">
        <div class="hdr-avatar">AI</div>
        <span class="online-dot"></span>
      </div>
      <div class="hdr-info">
        <div class="hdr-name">Enterprise AI Assistant</div>
        <div class="hdr-sub">
          <span class="sub-dot"></span> Online · Powered by AI
        </div>
      </div>
      <button class="icon-btn" (click)="open = false" title="Minimize">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
    </div>

    <!-- Messages -->
    <div class="msgs" #msgArea>
      <div class="enc-badge">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        End-to-end encrypted
      </div>

      @for (m of messages; track m.time + m.role) {
        <!-- Bot message -->
        @if (m.role === 'bot') {
          <div class="msg-row bot">
            <div class="msg-av bot-av">AI</div>
            <div class="msg-body">
              <div class="bubble bot-bbl">{{ m.text }}</div>
              <div class="msg-meta">
                {{ m.time }}
                @if (m.escalate) { <span class="escalate-tag">⚠ Escalation suggested</span> }
                @if (m.intent && m.intent !== 'unknown' && m.intent !== 'help' && m.intent !== 'greeting') {
                  <span class="intent-tag">{{ m.intent }}</span>
                }
              </div>
            </div>
          </div>
        }
        <!-- User message -->
        @if (m.role === 'user') {
          <div class="msg-row user">
            <div class="msg-body">
              <div class="bubble user-bbl">{{ m.text }}</div>
              <div class="msg-meta user-meta">{{ m.time }}</div>
            </div>
            <div class="msg-av user-av">ME</div>
          </div>
        }
      }

      <!-- Typing -->
      @if (typing) {
        <div class="msg-row bot">
          <div class="msg-av bot-av">AI</div>
          <div class="bubble bot-bbl typing">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>
        </div>
      }
    </div>

    <!-- Quick Replies -->
    @if (showQuick && !typing) {
      <div class="quick-bar">
        @for (q of quickReplies; track q) {
          <button class="quick-btn" (click)="send(q)">{{ q }}</button>
        }
      </div>
    }

    <!-- Input -->
    <div class="input-area">
      <div class="input-wrap">
        <input #inputEl [(ngModel)]="draft" (keydown.enter)="send(draft)" placeholder="Ask me anything…" [disabled]="typing" autocomplete="off">
        <button class="send-btn" (click)="send(draft)" [disabled]="!draft.trim() || typing">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="6 11 12 5 18 11"/></svg>
        </button>
      </div>
      <div class="input-footer">AI may make mistakes. Verify important information.</div>
    </div>
  </div>
}
  `,
  styles: [`
    /* Toast */
    .toast-container { position: fixed; top: 1.25rem; right: 1.25rem; z-index: 9999; display: flex; flex-direction: column; gap: .65rem; }
    .toast {
      min-width: 280px; max-width: 360px; padding: .85rem 1rem; border-radius: 12px;
      border-left: 4px solid; display: flex; gap: .75rem; align-items: flex-start;
      box-shadow: 0 8px 24px rgba(0,0,0,.2); background: var(--surface, #fff);
      animation: slideUp .3s ease;
      i { font-size: 1rem; flex-shrink: 0; margin-top: .1rem; }
      .toast-body strong { display: block; font-size: .88rem; color: var(--text,#0f172a); }
      .toast-body span   { font-size: .8rem; color: var(--text-muted,#64748b); }
      .toast-close { margin-left: auto; background: none; border: none; font-size: 1.2rem; color: var(--text-muted,#64748b); cursor: pointer; align-self: flex-start; line-height: 1; }
    }
    .toast.success { border-color: #22c55e; i { color: #22c55e; } }
    .toast.error   { border-color: #ef4444; i { color: #ef4444; } }
    .toast.warning { border-color: #f59e0b; i { color: #f59e0b; } }
    .toast.info    { border-color: #19cdbb; i { color: #19cdbb; } }

    /* Launcher */
    .launcher {
      position: fixed; right: 28px; bottom: 28px; z-index: 1000;
      width: 60px; height: 60px; border-radius: 18px; border: none;
      background: linear-gradient(135deg, #19cdbb, #0fb5a4); color: #04231f;
      cursor: pointer; box-shadow: 0 10px 32px rgba(25,205,187,.45);
      display: flex; align-items: center; justify-content: center;
      animation: popIn .3s ease; transition: transform .15s, box-shadow .15s;
      &:hover { transform: scale(1.06); box-shadow: 0 14px 40px rgba(25,205,187,.55); }
    }
    .badge { position: absolute; top: -4px; right: -4px; width: 20px; height: 20px; border-radius: 50%; background: #ef4444; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid var(--bg,#f8fafc); }

    /* Panel */
    .panel {
      position: fixed; right: 28px; bottom: 28px; z-index: 1000;
      width: min(390px, calc(100vw - 32px)); height: min(640px, calc(100vh - 110px));
      display: flex; flex-direction: column;
      background: #121826; border: 1px solid rgba(255,255,255,.09);
      border-radius: 22px; box-shadow: 0 24px 70px rgba(0,0,0,.55);
      overflow: hidden; animation: slideUp .34s cubic-bezier(.2,.9,.3,1);
      font-family: 'IBM Plex Sans', -apple-system, sans-serif;
    }

    /* Header */
    .panel-header { display: flex; align-items: center; gap: 11px; padding: 14px 15px; border-bottom: 1px solid rgba(255,255,255,.09); background: #121826; flex-shrink: 0; }
    .hdr-avatar-wrap { position: relative; flex-shrink: 0; }
    .hdr-avatar { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg,#19cdbb,#0fb5a4); color: #04231f; font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center; }
    .online-dot { position: absolute; right: -2px; bottom: -2px; width: 12px; height: 12px; border-radius: 50%; background: #22c55e; border: 2px solid #121826; }
    .hdr-info { flex: 1; }
    .hdr-name { font-weight: 700; font-size: 14px; color: #e8edf5; }
    .hdr-sub { display: flex; align-items: center; gap: 5px; color: #8893a6; font-size: 11.5px; margin-top: 2px; }
    .sub-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: glow 2s ease-in-out infinite; }
    .icon-btn { width: 32px; height: 32px; border: none; background: rgba(255,255,255,.07); border-radius: 9px; color: #8893a6; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .15s; &:hover{background:rgba(255,255,255,.13);color:#e8edf5;} }

    /* Messages */
    .msgs { flex: 1; overflow-y: auto; padding: 14px 13px 6px; background: #0c111b; display: flex; flex-direction: column; gap: 4px; }
    .msgs::-webkit-scrollbar { width: 5px; }
    .msgs::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 4px; }
    .enc-badge { display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 10.5px; color: #8893a6; background: rgba(255,255,255,.04); padding: 4px 11px; border-radius: 999px; border: 1px solid rgba(255,255,255,.06); margin: 0 auto 13px; width: fit-content; }
    .msg-row { display: flex; gap: 8px; align-items: flex-end; margin-bottom: 9px; }
    .msg-row.user { flex-direction: row-reverse; }
    .msg-av { width: 27px; height: 27px; border-radius: 9px; flex-shrink: 0; font-weight: 700; font-size: 9.5px; display: flex; align-items: center; justify-content: center; }
    .bot-av  { background: linear-gradient(135deg,#19cdbb,#0fb5a4); color:#04231f; }
    .user-av { background: rgba(255,255,255,.08); color:#8893a6; border:1px solid rgba(255,255,255,.1); }
    .msg-body { max-width: 78%; display: flex; flex-direction: column; }
    .user .msg-body { align-items: flex-end; }
    .bubble { padding: 10px 13px; font-size: 13.5px; line-height: 1.55; white-space: pre-wrap; word-break: break-word; }
    .bot-bbl { background: #1b2433; border: 1px solid rgba(255,255,255,.08); color: #e8edf5; border-radius: 15px 15px 15px 5px; }
    .user-bbl { background: linear-gradient(135deg,#19cdbb,#0fb5a4); color: #04231f; font-weight: 500; border-radius: 15px 15px 5px 15px; }
    .msg-meta { font-size: 10px; color: #8893a6; margin-top: 4px; padding-left: 3px; display: flex; align-items: center; gap: 6px; }
    .user-meta { justify-content: flex-end; padding-right: 3px; padding-left: 0; }
    .escalate-tag { background: rgba(239,68,68,.18); color: #f87171; padding: 1px 6px; border-radius: 999px; font-size: 9.5px; font-weight: 600; }
    .intent-tag { background: rgba(25,205,187,.14); color: #19cdbb; padding: 1px 6px; border-radius: 999px; font-size: 9.5px; font-weight: 600; text-transform: capitalize; }
    .typing { display: flex; gap: 5px; align-items: center; padding: 13px 15px; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: #8893a6; animation: blink 1.2s infinite; }
    .dot:nth-child(2) { animation-delay: .18s; }
    .dot:nth-child(3) { animation-delay: .36s; }

    /* Quick Replies */
    .quick-bar { display: flex; gap: 6px; padding: 9px 13px 3px; overflow-x: auto; flex-shrink: 0; background: #0c111b; }
    .quick-bar::-webkit-scrollbar { display: none; }
    .quick-btn { white-space: nowrap; flex-shrink: 0; padding: 6px 12px; border-radius: 999px; border: 1px solid rgba(25,205,187,.3); background: rgba(25,205,187,.08); color: #19cdbb; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .15s, color .15s; &:hover{background:#19cdbb;color:#04231f;} }

    /* Input */
    .input-area { padding: 10px 13px 13px; background: #0c111b; flex-shrink: 0; border-top: 1px solid rgba(255,255,255,.06); }
    .input-wrap { display: flex; align-items: center; gap: 7px; background: #1b2433; border: 1px solid rgba(255,255,255,.1); border-radius: 13px; padding: 5px 5px 5px 13px; transition: border-color .2s; &:focus-within{border-color:rgba(25,205,187,.4);} }
    .input-wrap input { flex: 1; border: none; outline: none; background: transparent; color: #e8edf5; font-size: 13.5px; font-family: inherit; padding: 6px 0; &::placeholder{color:#8893a6;} &:disabled{opacity:.45;} }
    .send-btn { width: 36px; height: 36px; border: none; border-radius: 10px; background: linear-gradient(135deg,#19cdbb,#0fb5a4); color: #04231f; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: filter .15s, opacity .15s; &:hover:not(:disabled){filter:brightness(1.1);} &:disabled{opacity:.4;cursor:default;} }
    .input-footer { font-size: 10px; color: #8893a6; text-align: center; margin-top: 8px; }

    @keyframes slideUp { from{opacity:0;transform:translateY(14px) scale(.98)} to{opacity:1;transform:none} }
    @keyframes popIn  { 0%{transform:scale(.6);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
    @keyframes blink  { 0%,60%,100%{opacity:.25;transform:translateY(0)} 30%{opacity:1;transform:translateY(-3px)} }
    @keyframes glow   { 0%,100%{opacity:.6} 50%{opacity:1} }
  `]
})
export class ChatWidgetComponent implements OnInit, AfterViewChecked {
  @ViewChild('msgArea') msgArea!: ElementRef<HTMLElement>;
  @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement>;

  open = false;
  typing = false;
  draft = '';
  unread = 1;
  showQuick = true;
  messages: ChatMessage[] = [];
  private needsScroll = false;

  quickReplies = [
    'How can you help me?',
    'Check my case status',
    'I need urgent support',
    'Knowledge base',
  ];

  constructor(private chatbot: ChatbotService, public toast: ToastService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.pushBot(
        "Hi! 👋 I'm your Enterprise AI Assistant.\nI can help you with support requests, case status, and general queries. How can I help you today?",
        'greeting'
      );
    }, 600);
  }

  ngAfterViewChecked(): void {
    if (this.needsScroll) { this.scrollBottom(); this.needsScroll = false; }
  }

  private now(): string {
    const d = new Date();
    let h = d.getHours();
    const m = d.getMinutes();
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m < 10 ? '0' + m : m} ${ap}`;
  }

  private pushBot(text: string, intent = '', escalate = false): void {
    this.messages.push({ role: 'bot', text, time: this.now(), intent, escalate });
    this.needsScroll = true;
    if (!this.open) this.unread++;
  }

  send(text: string): void {
    const t = (text || '').trim();
    if (!t || this.typing) return;
    this.draft = ''; this.showQuick = false;
    this.messages.push({ role: 'user', text: t, time: this.now() });
    this.typing = true; this.needsScroll = true;
    if (this.open) this.unread = 0;

    this.chatbot.sendMessage(t).subscribe({
      next: r => {
        this.chatbot.setSessionId(r.session_id);
        this.typing = false;
        this.pushBot(r.response, r.intent, r.should_escalate);
      },
      error: () => {
        this.typing = false;
        this.pushBot("I'm having trouble connecting right now. Please try again shortly.");
      }
    });
  }

  private scrollBottom(): void {
    if (this.msgArea?.nativeElement) {
      const el = this.msgArea.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
