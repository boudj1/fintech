import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Message {
  id: number;
  role: 'bot' | 'user';
  text: string;
  time: string;
  intent?: string;
  escalate?: boolean;
}

interface ChatResponse {
  response: string;
  session_id: string;
  intent: string;
  language: string;
  confidence: number;
  should_escalate: boolean;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<!-- ── Launcher ── -->
@if (!open) {
  <button class="launcher" (click)="open = true" title="Open AI Assistant">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    @if (unread > 0) {
      <span class="badge">{{ unread }}</span>
    }
  </button>
}

<!-- ── Chat Panel ── -->
@if (open) {
  <div class="chat-panel">

    <!-- Header -->
    <div class="panel-header">
      <div class="avatar-wrap">
        <div class="avatar">AI</div>
        <span class="dot-online"></span>
      </div>
      <div class="header-info">
        <div class="header-name">Enterprise AI Assistant</div>
        <div class="header-status">
          <span class="status-dot"></span>
          Online · Powered by AI
        </div>
      </div>
      <button class="icon-btn" (click)="open = false" title="Minimize">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.2" stroke-linecap="round">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
    </div>

    <!-- Messages -->
    <div class="messages" #msgContainer>
      <div class="enc-notice">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        End-to-end encrypted
      </div>

      @for (msg of messages; track msg.id) {
        <!-- Bot message -->
        @if (msg.role === 'bot') {
          <div class="msg-row bot">
            <div class="msg-avatar">AI</div>
            <div class="msg-body">
              <div class="bubble bot-bubble">{{ msg.text }}</div>
              <div class="msg-meta">
                {{ msg.time }}
                @if (msg.escalate) {
                  <span class="escalate-badge">⚠ Escalation suggested</span>
                }
                @if (msg.intent && msg.intent !== 'unknown') {
                  <span class="intent-badge">{{ msg.intent }}</span>
                }
              </div>
            </div>
          </div>
        }
        <!-- User message -->
        @if (msg.role === 'user') {
          <div class="msg-row user">
            <div class="msg-body">
              <div class="bubble user-bubble">{{ msg.text }}</div>
              <div class="msg-meta user-meta">{{ msg.time }}</div>
            </div>
            <div class="msg-avatar user-av">ME</div>
          </div>
        }
      }

      <!-- Typing indicator -->
      @if (typing) {
        <div class="msg-row bot">
          <div class="msg-avatar">AI</div>
          <div class="bubble bot-bubble typing-bubble">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>
        </div>
      }
    </div>

    <!-- Quick replies -->
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
        <input
          #inputEl
          [(ngModel)]="draft"
          (keydown.enter)="onEnter($event)"
          placeholder="Ask me anything…"
          [disabled]="typing"
          autocomplete="off"
        />
        <button
          class="send-btn"
          (click)="send(draft)"
          [disabled]="!draft.trim() || typing"
          title="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"/>
            <polyline points="6 11 12 5 18 11"/>
          </svg>
        </button>
      </div>
      <div class="input-footer">AI can make mistakes. Verify critical information.</div>
    </div>
  </div>
}
  `,
  styles: [`
    /* ── Launcher ── */
    .launcher {
      position: fixed; right: 28px; bottom: 28px; z-index: 1000;
      width: 60px; height: 60px; border-radius: 18px; border: none;
      background: linear-gradient(135deg, #19cdbb, #0fb5a4);
      color: #04231f; cursor: pointer;
      box-shadow: 0 10px 32px rgba(25,205,187,.45);
      display: flex; align-items: center; justify-content: center;
      animation: popIn .3s ease;
      transition: transform .15s, box-shadow .15s;
    }
    .launcher:hover { transform: scale(1.06); box-shadow: 0 14px 40px rgba(25,205,187,.55); }
    .badge {
      position: absolute; top: -4px; right: -4px;
      width: 20px; height: 20px; border-radius: 50%;
      background: #ef4444; color: #fff;
      font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #fff;
    }

    /* ── Panel ── */
    .chat-panel {
      position: fixed; right: 28px; bottom: 28px; z-index: 1000;
      width: min(400px, calc(100vw - 32px));
      height: min(650px, calc(100vh - 110px));
      display: flex; flex-direction: column;
      background: #121826; border: 1px solid rgba(255,255,255,.09);
      border-radius: 22px;
      box-shadow: 0 24px 70px rgba(0,0,0,.55), 0 2px 0 rgba(255,255,255,.03) inset;
      overflow: hidden; animation: slideUp .34s cubic-bezier(.2,.9,.3,1);
      font-family: 'IBM Plex Sans', -apple-system, sans-serif;
    }

    /* ── Header ── */
    .panel-header {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.09);
      background: #121826; flex-shrink: 0;
    }
    .avatar-wrap { position: relative; flex-shrink: 0; }
    .avatar {
      width: 40px; height: 40px; border-radius: 12px;
      background: linear-gradient(135deg, #19cdbb, #0fb5a4);
      color: #04231f; font-weight: 800; font-size: 13px;
      display: flex; align-items: center; justify-content: center;
    }
    .dot-online {
      position: absolute; right: -2px; bottom: -2px;
      width: 12px; height: 12px; border-radius: 50%;
      background: #22c55e; border: 2px solid #121826;
    }
    .header-info { flex: 1; min-width: 0; }
    .header-name { font-weight: 700; font-size: 14px; color: #e8edf5; }
    .header-status {
      display: flex; align-items: center; gap: 5px;
      color: #8893a6; font-size: 11.5px; margin-top: 2px;
    }
    .status-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
      animation: glow 2s ease-in-out infinite;
    }
    .icon-btn {
      width: 32px; height: 32px; border: none;
      background: rgba(255,255,255,.07); border-radius: 9px;
      color: #8893a6; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background .15s;
    }
    .icon-btn:hover { background: rgba(255,255,255,.13); color: #e8edf5; }

    /* ── Messages ── */
    .messages {
      flex: 1; overflow-y: auto; padding: 16px 14px 8px;
      background: #0c111b; display: flex; flex-direction: column; gap: 4px;
      scroll-behavior: smooth;
    }
    .messages::-webkit-scrollbar { width: 5px; }
    .messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 4px; }
    .messages::-webkit-scrollbar-track { background: transparent; }

    .enc-notice {
      display: flex; align-items: center; justify-content: center; gap: 5px;
      font-size: 10.5px; color: #8893a6;
      background: rgba(255,255,255,.04); padding: 5px 12px;
      border-radius: 999px; border: 1px solid rgba(255,255,255,.07);
      margin: 0 auto 14px; width: fit-content;
    }

    .msg-row {
      display: flex; gap: 9px; align-items: flex-end; margin-bottom: 10px;
    }
    .msg-row.user { flex-direction: row-reverse; }

    .msg-avatar {
      width: 28px; height: 28px; border-radius: 9px; flex-shrink: 0;
      background: linear-gradient(135deg, #19cdbb, #0fb5a4);
      color: #04231f; font-weight: 800; font-size: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .user-av {
      background: rgba(255,255,255,.08); color: #8893a6;
      border: 1px solid rgba(255,255,255,.1);
    }

    .msg-body { max-width: 80%; display: flex; flex-direction: column; }

    .bubble {
      padding: 11px 14px; font-size: 13.5px; line-height: 1.55;
      white-space: pre-wrap; word-break: break-word;
    }
    .bot-bubble {
      background: #1b2433; border: 1px solid rgba(255,255,255,.08);
      color: #e8edf5; border-radius: 16px 16px 16px 5px;
    }
    .user-bubble {
      background: linear-gradient(135deg, #19cdbb, #0fb5a4);
      color: #04231f; font-weight: 500;
      border-radius: 16px 16px 5px 16px;
    }

    .msg-meta {
      font-size: 10px; color: #8893a6; margin-top: 4px; padding-left: 4px;
      display: flex; align-items: center; gap: 6px;
    }
    .user-meta { justify-content: flex-end; padding-right: 4px; padding-left: 0; }

    .escalate-badge {
      background: rgba(239,68,68,.18); color: #f87171;
      padding: 2px 7px; border-radius: 999px; font-size: 9.5px; font-weight: 600;
    }
    .intent-badge {
      background: rgba(25,205,187,.15); color: #19cdbb;
      padding: 2px 7px; border-radius: 999px; font-size: 9.5px; font-weight: 600;
      text-transform: capitalize;
    }

    /* Typing dots */
    .typing-bubble { display: flex; gap: 5px; align-items: center; padding: 14px 16px; }
    .dot {
      width: 7px; height: 7px; border-radius: 50%; background: #8893a6;
      animation: blink 1.2s infinite;
    }
    .dot:nth-child(2) { animation-delay: .18s; }
    .dot:nth-child(3) { animation-delay: .36s; }

    /* ── Quick replies ── */
    .quick-bar {
      display: flex; gap: 7px; padding: 10px 14px 4px;
      overflow-x: auto; flex-shrink: 0; background: #0c111b;
    }
    .quick-bar::-webkit-scrollbar { display: none; }
    .quick-btn {
      white-space: nowrap; flex-shrink: 0;
      padding: 7px 13px; border-radius: 999px;
      border: 1px solid rgba(25,205,187,.35);
      background: rgba(25,205,187,.08); color: #19cdbb;
      font-size: 12px; font-weight: 600; cursor: pointer;
      font-family: inherit; transition: background .15s, color .15s;
    }
    .quick-btn:hover {
      background: #19cdbb; color: #04231f;
    }

    /* ── Input ── */
    .input-area {
      padding: 10px 14px 14px; background: #0c111b; flex-shrink: 0;
      border-top: 1px solid rgba(255,255,255,.06);
    }
    .input-wrap {
      display: flex; align-items: center; gap: 8px;
      background: #1b2433; border: 1px solid rgba(255,255,255,.1);
      border-radius: 14px; padding: 6px 6px 6px 14px;
      transition: border-color .2s;
    }
    .input-wrap:focus-within { border-color: rgba(25,205,187,.45); }
    .input-wrap input {
      flex: 1; border: none; outline: none;
      background: transparent; color: #e8edf5;
      font-size: 13.5px; font-family: inherit; padding: 6px 0;
    }
    .input-wrap input::placeholder { color: #8893a6; }
    .input-wrap input:disabled { opacity: .5; }
    .send-btn {
      width: 38px; height: 38px; flex-shrink: 0;
      border: none; border-radius: 11px;
      background: linear-gradient(135deg, #19cdbb, #0fb5a4);
      color: #04231f; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: filter .15s, opacity .15s;
    }
    .send-btn:hover:not(:disabled) { filter: brightness(1.1); }
    .send-btn:disabled { opacity: .4; cursor: default; }
    .input-footer {
      font-size: 10px; color: #8893a6; text-align: center; margin-top: 8px;
    }

    /* ── Animations ── */
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px) scale(.98); }
      to   { opacity: 1; transform: none; }
    }
    @keyframes popIn {
      0%   { transform: scale(.6); opacity: 0; }
      60%  { transform: scale(1.05); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes blink {
      0%, 60%, 100% { opacity: .25; transform: translateY(0); }
      30%            { opacity: 1;   transform: translateY(-3px); }
    }
    @keyframes glow {
      0%, 100% { opacity: .6; }
      50%       { opacity: 1; }
    }
  `]
})
export class ChatWidgetComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('msgContainer') msgContainer!: ElementRef<HTMLElement>;
  @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement>;

  open = false;
  typing = false;
  draft = '';
  unread = 1;
  showQuick = true;
  sessionId: string | null = null;
  private nextId = 0;
  private shouldScroll = false;

  messages: Message[] = [];

  quickReplies = [
    'How can you help me?',
    'Show recent conversations',
    'Customer support options',
    'Escalate to agent',
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    setTimeout(() => this.pushBot(
      "Hi! I'm your Enterprise AI Assistant. 👋\nI can help with customer support, conversations, knowledge base queries, and more.\nHow can I help you today?",
      'greeting'
    ), 400);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {}

  private now(): string {
    const d = new Date();
    let h = d.getHours();
    const m = d.getMinutes();
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m < 10 ? '0' + m : m} ${ap}`;
  }

  private pushBot(text: string, intent = '', escalate = false): void {
    this.messages.push({ id: ++this.nextId, role: 'bot', text, time: this.now(), intent, escalate });
    this.shouldScroll = true;
    if (!this.open) this.unread++;
  }

  private pushUser(text: string): void {
    this.messages.push({ id: ++this.nextId, role: 'user', text, time: this.now() });
    this.shouldScroll = true;
  }

  private scrollBottom(): void {
    if (this.msgContainer?.nativeElement) {
      const el = this.msgContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  onEnter(e: Event): void {
    e.preventDefault();
    this.send(this.draft);
  }

  send(text: string): void {
    const t = text.trim();
    if (!t || this.typing) return;
    this.draft = '';
    this.showQuick = false;
    this.pushUser(t);
    this.typing = true;
    this.shouldScroll = true;
    if (this.open) this.unread = 0;

    const body: any = { message: t };
    if (this.sessionId) body.session_id = this.sessionId;

    this.http.post<ChatResponse>(`${environment.chatbotUrl}/api/chatbot/message`, body).subscribe({
      next: (res) => {
        this.sessionId = res.session_id;
        this.typing = false;
        this.pushBot(res.response, res.intent, res.should_escalate);
      },
      error: () => {
        this.typing = false;
        this.pushBot("I'm having trouble connecting right now. Please try again in a moment.", 'error');
      }
    });
  }

  get panelOpen(): boolean { return this.open; }

  openPanel(): void {
    this.open = true;
    this.unread = 0;
    setTimeout(() => this.inputEl?.nativeElement?.focus(), 100);
  }
}
