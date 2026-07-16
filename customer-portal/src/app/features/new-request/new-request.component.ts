import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConversationService } from '../../core/services/conversation.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-new-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page animate-up">
      <div class="page-header">
        <div>
          <h2>New Support Request</h2>
          <p>Describe your issue and we'll connect you with the right team</p>
        </div>
        <a routerLink="/conversations" class="btn btn-secondary">
          <i class="fas fa-arrow-left"></i> Back to Cases
        </a>
      </div>

      <div class="two-col">
        <!-- Form -->
        <div class="form-card card">
          <form (ngSubmit)="submit()">
            <div class="form-group">
              <label>Subject *</label>
              <input class="form-control" type="text" [(ngModel)]="form.subject" name="subj"
                placeholder="Brief description of your issue" required>
            </div>

            <div class="form-group">
              <label>Channel</label>
              <select class="form-control" [(ngModel)]="form.channel" name="ch">
                <option value="WEB">Web Portal</option>
                <option value="EMAIL">Email</option>
                <option value="CHAT">Live Chat</option>
                <option value="PHONE">Phone</option>
              </select>
            </div>

            <div class="form-group">
              <label>Language</label>
              <select class="form-control" [(ngModel)]="form.language" name="lang">
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="ar">Arabic</option>
                <option value="es">Spanish</option>
              </select>
            </div>

            <div class="form-group">
              <label>Message *</label>
              <textarea class="form-control" [(ngModel)]="form.initialMessage" name="msg" rows="6"
                placeholder="Please provide as much detail as possible about your issue, including any relevant account information or error messages you've encountered." required></textarea>
              <span class="char-count">{{ form.initialMessage.length }} characters</span>
            </div>

            @if (error()) {
              <div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> {{ error() }}</div>
            }

            <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="loading() || !form.subject.trim() || !form.initialMessage.trim()">
              @if (loading()) { <span class="spinner-sm"></span> Submitting… }
              @else { <i class="fas fa-paper-plane"></i> Submit Request }
            </button>
          </form>
        </div>

        <!-- Sidebar Tips -->
        <div class="sidebar">
          <div class="card tip-card">
            <h4><i class="fas fa-lightbulb"></i> Tips for faster resolution</h4>
            <ul>
              <li>Include your account ID or order number</li>
              <li>Describe the exact steps that led to the issue</li>
              <li>Attach any error messages you received</li>
              <li>Mention when the issue first started</li>
            </ul>
          </div>

          <div class="card ai-card">
            <div class="ai-icon"><i class="fas fa-robot"></i></div>
            <h4>AI-Powered Support</h4>
            <p>Our AI assistant will analyse your request and provide an immediate response while connecting you with the right agent.</p>
          </div>

          <div class="card sla-card">
            <h4>Response Times</h4>
            <div class="sla-list">
              <div class="sla-item">
                <span class="sla-label"><span class="dot critical"></span>Critical</span>
                <span class="sla-time">1 hour</span>
              </div>
              <div class="sla-item">
                <span class="sla-label"><span class="dot high"></span>High Priority</span>
                <span class="sla-time">4 hours</span>
              </div>
              <div class="sla-item">
                <span class="sla-label"><span class="dot normal"></span>Standard</span>
                <span class="sla-time">24 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .page-header h2 { margin-bottom: .25rem; }
    .page-header p { color: var(--text-muted); font-size: .88rem; }

    .two-col { display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; align-items: start; }
    .sidebar { display: flex; flex-direction: column; gap: 1rem; }

    .char-count { font-size: .75rem; color: var(--text-muted); text-align: right; margin-top: .25rem; }
    .alert { padding: .75rem 1rem; border-radius: 10px; margin-bottom: 1rem; display: flex; align-items: center; gap: .6rem; font-size: .88rem; }
    .alert-error { background: rgba(239,68,68,.08); color: #ef4444; border: 1px solid rgba(239,68,68,.15); }

    .tip-card h4 { display: flex; align-items: center; gap: .5rem; margin-bottom: 1rem; i{color:var(--primary);} }
    .tip-card ul { list-style: none; display: flex; flex-direction: column; gap: .6rem; }
    .tip-card li { display: flex; align-items: flex-start; gap: .5rem; font-size: .85rem; color: var(--text-muted);
      &::before { content: '✓'; color: var(--primary); font-weight: 700; flex-shrink: 0; } }

    .ai-card { text-align: center; padding: 1.5rem; }
    .ai-icon { width: 52px; height: 52px; border-radius: 14px; background: rgba(25,205,187,.1); color: var(--primary); font-size: 1.4rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
    .ai-card h4 { margin-bottom: .5rem; }
    .ai-card p { font-size: .83rem; }

    .sla-card h4 { margin-bottom: .9rem; }
    .sla-list { display: flex; flex-direction: column; gap: .7rem; }
    .sla-item { display: flex; justify-content: space-between; align-items: center; font-size: .85rem; }
    .sla-label { display: flex; align-items: center; gap: .5rem; color: var(--text-muted); }
    .sla-time { font-weight: 600; color: var(--text); }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .dot.critical { background: #ef4444; }
    .dot.high     { background: #f59e0b; }
    .dot.normal   { background: #22c55e; }

    .spinner-sm { width:16px; height:16px; border-radius:50%; border:2px solid rgba(4,35,31,.3); border-top-color:#04231f; animation:spin .7s linear infinite; display:inline-block; }
    @keyframes spin{to{transform:rotate(360deg)}}

    @media(max-width:900px) { .two-col { grid-template-columns: 1fr; } }
  `]
})
export class NewRequestComponent {
  form: { subject: string; channel: 'WEB'|'EMAIL'|'PHONE'|'CHAT'; language: string; initialMessage: string } = { subject: '', channel: 'WEB', language: 'en', initialMessage: '' };
  loading = signal(false);
  error = signal('');

  constructor(
    private svc: ConversationService,
    private router: Router,
    private toast: ToastService
  ) {}

  submit(): void {
    this.error.set(''); this.loading.set(true);
    this.svc.create(this.form).subscribe({
      next: c => {
        this.toast.success('Request submitted!', 'Your case has been created.');
        this.router.navigate(['/conversations', c.id]);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e.error?.message || 'Failed to create request. Please try again.');
      }
    });
  }
}
